import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ─── MindCare API Client ──────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:5000/api";

async function apiPredict(text) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, include_all_scores: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).result;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVELS_INFO = [
  { level: 0, name: "Normal",               color: "#34D399", bg: "rgba(52,211,153,0.1)", icon: "✅" },
  { level: 1, name: "Mild Stress",           color: "#A3E635", bg: "rgba(163,230,53,0.1)", icon: "🟡" },
  { level: 2, name: "Moderate Stress",       color: "#FACC15", bg: "rgba(250,204,21,0.1)", icon: "🟠" },
  { level: 3, name: "Severe Stress",         color: "#FB923C", bg: "rgba(251,146,60,0.1)", icon: "🔶" },
  { level: 4, name: "Mild Anxiety",          color: "#F87171", bg: "rgba(248,113,113,0.1)", icon: "🔴" },
  { level: 5, name: "Moderate Anxiety",      color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: "🚨" },
  { level: 6, name: "Suicidal Ideation",     color: "#A78BFA", bg: "rgba(167,139,250,0.1)", icon: "⚠️" },
  { level: 7, name: "Depression Risk",       color: "#F43F5E", bg: "rgba(244,63,94,0.1)", icon: "🆘" },
];

// ─── Demo mode (runs when API not available) ──────────────────────────────────
function demoPredict(text) {
  const t = text.toLowerCase();
  let level = 0, confidence = 0.91;
  if (/suicide|kill myself|end it|no reason to live|worthless|burden/.test(t)) { level = 6; confidence = 0.95; }
  else if (/hopeless|depressed|depression|can't go on|nothing matters/.test(t)) { level = 4; confidence = 0.88; }
  else if (/panic|paranoid|anxiety|can't breathe|terrified|paralyzed/.test(t)) { level = 5; confidence = 0.84; }
  else if (/overwhelmed|can't cope|exhausted|falling apart|so much stress/.test(t)) { level = 3; confidence = 0.82; }
  else if (/anxious|nervous|worried|stressed|struggling/.test(t)) { level = 2; confidence = 0.79; }
  else if (/little sad|bit down|not great|slightly/.test(t)) { level = 1; confidence = 0.76; }
  
  const info = LEVELS_INFO[level];
  const allProbs = {};
  LEVELS_INFO.forEach((l, i) => {
    allProbs[l.name] = i === level ? confidence : Math.random() * (1 - confidence) / 6;
  });
  
  const highlights = [];
  const words = text.split(/\s+/);
  const CRISIS = new Set(["suicide","suicidal","kill","die","hopeless","worthless","depressed","overwhelmed","panic","anxious","stressed","worried"]);
  words.forEach(w => {
    const wc = w.toLowerCase().replace(/[^a-z]/g, "");
    if (CRISIS.has(wc)) highlights.push({ word: w, score: 0.9, type: wc.match(/suicide|kill|die|hopeless/) ? "crisis" : "moderate" });
  });
  
  return { level, level_name: info.name, confidence, intervention: "Demo Intervention", color: info.color, icon: info.icon, class_probs: allProbs, highlights, model_used: "Demo Model", urgent: level >= 6, clean_text: text };
}

// ─── Components ───────────────────────────────────────────────────────────────

function HighlightedText({ text, highlights }) {
  if (!highlights || highlights.length === 0) return <span style={{ color: "#94A3B8" }}>{text}</span>;
  const wordMap = {};
  highlights.forEach(h => { wordMap[h.word.toLowerCase()] = h; });
  const tokens = text.split(/(\s+)/);
  return (
    <span>
      {tokens.map((tok, i) => {
        const h = wordMap[tok.toLowerCase().replace(/[^a-z']/g, "")];
        if (!h) return <span key={i} style={{ color: "#94A3B8" }}>{tok}</span>;
        return (
          <mark key={i} style={{ background: "rgba(45,212,191,0.2)", color: "#2DD4BF", padding: "2px 4px", borderRadius: 4, fontWeight: 600 }}>
            {tok}
          </mark>
        );
      })}
    </span>
  );
}

function ResultCard({ result }) {
  const levelInfo = LEVELS_INFO[Math.min(result.level, LEVELS_INFO.length - 1)];
  const isUrgent  = result.urgent;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card" style={{ padding: 28, marginTop: 24, border: `2px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'var(--border-card)'}` }}>
      
      {isUrgent && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ color: "#EF4444", fontWeight: 700, marginBottom: 4 }}>🆘 Crisis Alert</div>
          <div style={{ color: "#FCA5A5", fontSize: 14 }}>Please contact a crisis helpline immediately.</div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 40, background: levelInfo?.bg, padding: 12, borderRadius: 16 }}>{result.icon}</div>
        <div>
          <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Level {result.level}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#F1F5F9" }}>{result.level_name}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: levelInfo?.color }}>{(result.confidence * 100).toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase" }}>Confidence</div>
        </div>
      </div>

      {result.highlights && result.highlights.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase" }}>Text Analysis Highlights</div>
          <div style={{ fontSize: 15, lineHeight: 1.6 }}>
            <HighlightedText text={result.clean_text || ""} highlights={result.highlights} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssessmentPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiOk, setApiOk] = useState(null);
  
  useEffect(() => {
    fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) })
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  const handlePredict = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = apiOk ? await apiPredict(text) : demoPredict(text);
      setResult(res);
    } catch (e) {
      setResult(demoPredict(text));
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: 120, minHeight: "100vh", paddingBottom: 80, position: "relative" }}>
      <div className="orb orb-teal" style={{ width: 600, height: 600, top: -100, right: -200 }} />
      <div className="noise-overlay" />
      
      <div className="container" style={{ maxWidth: 800, position: "relative", zIndex: 1, padding: "0 20px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>AI Assessment Tool</h1>
          <p style={{ color: "#94A3B8", marginBottom: 32 }}>Enter text for real-time semantic analysis.</p>
          
          <div className="glass-card" style={{ padding: 24 }}>
            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)}
              placeholder="Enter social media posts, journal entries, or any free-form text..."
              style={{ 
                width: "100%", minHeight: 160, background: "rgba(255,255,255,0.02)", 
                border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 16,
                color: "#F1F5F9", fontSize: 16, resize: "vertical", outline: "none"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <div style={{ fontSize: 13, color: "#64748B" }}>
                {apiOk === false ? "⚠️ Running in Demo Mode (API Offline)" : ""}
              </div>
              <button 
                className="btn-primary" 
                onClick={handlePredict} 
                disabled={!text.trim() || loading}
                style={{ opacity: !text.trim() || loading ? 0.5 : 1 }}
              >
                {loading ? "Analyzing..." : "Analyze Text"}
              </button>
            </div>
          </div>
        </motion.div>

        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
