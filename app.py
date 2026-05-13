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

if __name__ == '__main__':
    port  = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    print(f'\n🧠 MindCare API v2 — http://0.0.0.0:{port}')
    app.run(host='0.0.0.0', port=port, debug=debug)