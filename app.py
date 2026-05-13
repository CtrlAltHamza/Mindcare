"""
app_fixed.py — MindCare Flask API (v2 — crisis-aware)
Replace your existing app.py with this file.

Changes:
- Uses MindCarePredictor from mindcare_inference_fixed.py
- /api/predict response now includes keyword_override, matched_keywords, negation_detected
- /api/explain endpoint for human-readable decision trace
"""

import os
import traceback
import time
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS

from mindcare_inference import MindCarePredictor
from scrappers.reddit import fetch_user_text_posts
from scrappers.twitter import fetch_tweets

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

MODELS_DIR = os.environ.get('MODELS_DIR', '../models')
predictor  = MindCarePredictor(models_dir=MODELS_DIR)

@app.before_request
def start_timer():
    g.start = time.perf_counter()

@app.after_request
def add_timing(response):
    elapsed = round((time.perf_counter() - g.start) * 1000, 2)
    response.headers['X-Response-Time-Ms'] = elapsed
    return response

def error_response(msg, code=400):
    return jsonify({'error': msg, 'status': 'error'}), code

def require_json(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.is_json:
            return error_response('Content-Type must be application/json')
        return f(*args, **kwargs)
    return decorated


@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'name': 'MindCare API v2', 'status': 'healthy',
        'fixes': ['focal_loss', 'crisis_augmentation', 'keyword_override', 'negation_detection'],
    })


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'models': list(predictor.models.keys()),
        'keyword_categories': list(predictor.crisis_keywords.keys()),
    })


@app.route('/api/predict', methods=['POST'])
@require_json
def predict():
    """
    Predict mental health level.

    Response now includes:
      - keyword_override    : bool — whether clinical keywords raised the level above ML
      - matched_keywords    : list — crisis keywords found in the text
      - negation_detected   : bool — e.g. "dying laughing" negation detected
      - ml_level            : int — raw ML prediction before override
      - ml_level_name       : str — name of raw ML prediction
    """
    data = request.get_json()
    text = data.get('text', '').strip()
    if not text:
        return error_response('"text" is required.')
    if len(text) > 10000:
        return error_response('Text too long (max 10,000 characters).')
    try:
        result = predictor.predict(text, include_all_scores=data.get('include_all_scores', True))
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        traceback.print_exc()
        return error_response(str(e), 500)


@app.route('/api/explain', methods=['POST'])
@require_json
def explain():
    """
    Human-readable decision trace — useful for debugging in the notebook.
    Shows ML level, keyword matches, override decision, and final level.
    """
    data = request.get_json()
    text = data.get('text', '').strip()
    if not text:
        return error_response('"text" is required.')
    try:
        explanation = predictor.explain(text)
        result      = predictor.predict(text)
        return jsonify({'status': 'success', 'explanation': explanation, 'result': result})
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/predict/batch', methods=['POST'])
@require_json
def predict_batch():
    data  = request.get_json()
    texts = data.get('texts', [])
    if not isinstance(texts, list) or len(texts) == 0:
        return error_response('"texts" must be a non-empty list.')
    if len(texts) > 50:
        return error_response('Batch size limit is 50.')
    try:
        results = predictor.batch_predict(texts)
        return jsonify({'status': 'success', 'count': len(results), 'results': results})
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/assessment', methods=['POST'])
@require_json
def score_assessment():
    data      = request.get_json()
    atype     = data.get('type', '').upper()
    responses = data.get('responses', [])
    if atype not in ('PHQ9', 'GAD7'):
        return error_response('"type" must be "PHQ9" or "GAD7".')
    expected = 9 if atype == 'PHQ9' else 7
    if len(responses) != expected:
        return error_response(f'{atype} requires {expected} responses (0–3).')
    if not all(isinstance(r, int) and 0 <= r <= 3 for r in responses):
        return error_response('All responses must be integers 0–3.')
    total = sum(responses)
    if atype == 'PHQ9':
        severity, level = (
            ('Minimal', 0) if total <= 4 else
            ('Mild', 1)    if total <= 9 else
            ('Moderate', 2) if total <= 14 else
            ('Moderately Severe', 3) if total <= 19 else
            ('Severe', 4)
        )
        max_s = 27
    else:
        severity, level = (
            ('Minimal', 0) if total <= 4 else
            ('Mild', 1)    if total <= 9 else
            ('Moderate', 2) if total <= 14 else
            ('Severe', 3)
        )
        max_s = 21
    return jsonify({
        'status': 'success', 'type': atype, 'total_score': total,
        'severity': severity, 'severity_level': level, 'max_score': max_s,
        'percentage': round(total / max_s * 100, 1),
        'recommend_referral': level >= 2,
    })


@app.route('/api/scrape/reddit', methods=['POST'])
@require_json
def scrape_reddit():
    data = request.get_json()
    target = data.get('target', '').strip()
    limit = data.get('limit', 10)
    
    if not target:
        return error_response('"target" username is required.')
    
    try:
        posts = fetch_user_text_posts(target, limit)
        if not posts:
            return jsonify({'status': 'success', 'results': [], 'message': 'No text posts found.'})
            
        texts = [p['body'] for p in posts]
        predictions = predictor.batch_predict(texts)
        
        results = []
        for post, pred in zip(posts, predictions):
            results.append({
                'source_id': post['id'],
                'text': post['body'],
                'url': post['url'],
                'created_utc': post['created_utc'],
                'score': post['score'],
                'prediction': pred
            })
            
        return jsonify({'status': 'success', 'target': target, 'count': len(results), 'results': results})
    except Exception as e:
        traceback.print_exc()
        return error_response(str(e), 500)

@app.route('/api/scrape/twitter', methods=['POST'])
@require_json
def scrape_twitter():
    data = request.get_json()
    target = data.get('target', '').strip()
    limit = data.get('limit', 10)
    
    if not target:
        return error_response('"target" username is required.')
        
    if target.startswith('@'):
        target = target[1:]
        
    try:
        tweets = fetch_tweets(target, limit)
        if not tweets:
            return jsonify({'status': 'success', 'results': [], 'message': 'No tweets found.'})
            
        texts = [t['body'] for t in tweets]
        predictions = predictor.batch_predict(texts)
        
        results = []
        for tweet, pred in zip(tweets, predictions):
            results.append({
                'source_id': tweet['id'],
                'text': tweet['body'],
                'url': tweet['url'],
                'created_utc': tweet['created_utc'],
                'prediction': pred
            })
            
        return jsonify({'status': 'success', 'target': target, 'count': len(results), 'results': results})
    except Exception as e:
        traceback.print_exc()
        return error_response(str(e), 500)

@app.route('/api/chat', methods=['POST'])
@require_json
def chat():
    """
    Emotion-aware chat endpoint.
    Uses ML to detect user's mood and provides empathetic responses.
    Includes a keyword safety net to prevent tone-deaf replies on misclassification.
    """
    data = request.get_json()
    message = data.get('message', '').strip()

    if not message:
        return error_response('"message" is required.')

    try:
        # 1. Analyze user's emotional state using the MindCare Pipeline
        pred = predictor.predict(message)
        level = pred['level']

        # 2. Keyword safety net — override level if negative emotions are clearly present
        # This prevents the model from saying "I'm glad to hear that" when someone is sad.
        msg_lower = message.lower()

        negative_keywords = [
            'lonely', 'alone', 'sad', 'unhappy', 'miserable', 'depressed',
            'hopeless', 'worthless', 'lost', 'empty', 'numb', 'hurt',
            'cry', 'crying', 'tears', 'grief', 'grieve', 'heartbroken',
            'down', 'low', 'blue', 'gloomy', 'upset', 'broken', 'pain',
            'tired', 'exhausted', 'drained', 'stuck', 'trapped', 'helpless',
        ]
        crisis_keywords = [
            'suicidal', 'suicide', 'kill myself', 'end my life', 'want to die',
            'no reason to live', 'better off dead', 'cant go on', "can't go on",
        ]

        has_negative = any(kw in msg_lower for kw in negative_keywords)
        has_crisis   = any(kw in msg_lower for kw in crisis_keywords)

        if has_crisis:
            level = max(level, 6)
        elif has_negative and level == 0:
            level = 1  # Bump to at least Mild Stress for empathetic response

        # 3. Empathetic, CBT-inspired responses per level
        responses = {
            0: "Thank you for sharing. I'm always here if you want to talk or reflect on anything.",
            1: "I hear you — it sounds like things are weighing on you a bit. You're not alone. What's been on your mind lately?",
            2: "I'm sorry you're feeling this way. It takes courage to open up. Would you like to talk about what's been going on?",
            3: "That sounds really hard to carry. I want you to know your feelings are completely valid. I'm here to listen — tell me more.",
            4: "I can feel how heavy this is for you. You don't have to go through this alone. Please be kind to yourself right now.",
            5: "I'm really glad you're talking to me. What you're feeling is real and it matters. Would exploring some grounding techniques together help?",
            6: "I'm genuinely concerned about you and I care about your well-being. Please consider reaching out to a professional or a crisis line — you deserve real support.",
            7: "I'm right here with you. Please know you are not alone in this. I strongly encourage you to contact a crisis support service right now — they are trained to help with exactly this.",
        }

        reply = responses.get(level, "I'm here to support you. Tell me more about how you're feeling.")

        return jsonify({
            'status': 'success',
            'reply': reply,
            'analysis': {
                'level': level,
                'level_name': pred['level_name'],
                'confidence': pred['confidence']
            }
        })
    except Exception as e:
        traceback.print_exc()
        return error_response(str(e), 500)

if __name__ == '__main__':
    port  = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    print(f'\n🧠 MindCare API v2 — http://0.0.0.0:{port}')
    app.run(host='0.0.0.0', port=port, debug=debug)