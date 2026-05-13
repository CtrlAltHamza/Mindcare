import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, Sparkles, AlertCircle,
  MessageSquare, Trash2, Shield, Heart, CheckCircle2, ChevronRight
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

const QUICK_SUGGESTIONS = [
  "I'm feeling really stressed lately",
  "What should I do to feel better?",
  "I feel lonely and disconnected",
  "How can I manage my anxiety?",
  "I'm overwhelmed with my studies",
];

// Renders a bot message bubble — with optional recommendations card
function BotMessage({ msg }) {
  const hasRecs = msg.recommendations && msg.recommendations.steps;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {/* Main reply bubble */}
      <div style={{
        padding: '12px 16px',
        borderRadius: '18px 18px 18px 2px',
        background: 'rgba(30,41,59,0.85)',
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 1.65,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {msg.text}
      </div>

      {/* Recommendations card — shown only when backend returns them */}
      {hasRecs && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(139,92,246,0.06))',
            border: '1px solid rgba(45,212,191,0.2)',
            borderRadius: 14,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 12, color: '#2DD4BF', fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em' }}>
            💡 RECOMMENDATIONS
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12, lineHeight: 1.6, margin: '0 0 12px 0' }}>
            {msg.recommendations.consolation}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msg.recommendations.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={15} color="#2DD4BF" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.55 }}>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Sparkles size={10} color="#2DD4BF" />
        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: '1', type: 'bot',
      text: "Hello! I'm your MindCare Companion. I'm here to listen and support you. How are you feeling today?",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(), type: 'user', text, time: new Date()
    }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: data.reply,
          recommendations: data.recommendations,
          time: new Date(),
          analysis: data.analysis
        }]);
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), type: 'bot',
        text: "I'm having a little trouble connecting right now. Please check that the backend server is running and try again.",
        isError: true, time: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => { e.preventDefault(); sendMessage(input); };

  const clearChat = () => {
    if (window.confirm('Clear conversation?')) {
      setMessages([{ id: '1', type: 'bot', text: "Hello again! How can I support you?", time: new Date() }]);
      setAnalysis(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 50%), var(--bg-900)',
      paddingTop: 100, paddingBottom: 40,
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div className="noise-overlay" />

      <div className="container" style={{ maxWidth: 960, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, height: '80vh' }}>

          {/* ── Main Chat Window ── */}
          <div className="glass-card" style={{
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.6)'
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg, #14B8A6, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>MindCare Companion</div>
                  <div style={{ fontSize: 11, color: '#2DD4BF', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22C55E', marginRight: 5, boxShadow: '0 0 6px #22C55E' }} />
                    Always here to listen
                  </div>
                </div>
              </div>
              <button onClick={clearChat} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer' }} title="Clear Chat">
                <Trash2 size={17} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  msg.type === 'user' ? (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{ alignSelf: 'flex-end', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                    >
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '18px 18px 2px 18px',
                        background: 'linear-gradient(135deg, #0D9488, #0F766E)',
                        color: '#fff', fontSize: 14, lineHeight: 1.5,
                        boxShadow: '0 4px 12px rgba(13,148,136,0.2)'
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  ) : (
                    <BotMessage key={msg.id} msg={msg} />
                  )
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                    <div className="typing-indicator"><span /><span /><span /></div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Quick Suggestions */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    fontSize: 11, padding: '5px 10px', borderRadius: 20,
                    background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)',
                    color: '#64748B', cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#2DD4BF'; e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'rgba(45,212,191,0.15)'; }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
              padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
              borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10
            }}>
              <input
                type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share how you're feeling, or ask for advice…"
                style={{
                  flex: 1, background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                  padding: '11px 15px', color: '#F1F5F9', fontSize: 14, outline: 'none'
                }}
              />
              <button type="submit" disabled={!input.trim() || isTyping} className="btn-primary"
                style={{ padding: '0 18px', borderRadius: 12, opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}>
                <Send size={17} />
              </button>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Analysis Card */}
            <div className="glass-card" style={{ padding: 22, border: '1px solid rgba(45,212,191,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Sparkles size={16} color="#2DD4BF" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>Mood Analysis</span>
              </div>
              {analysis ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Detected State</div>
                    <div style={{
                      fontSize: 17, fontWeight: 800,
                      color: analysis.level >= 5 ? '#EF4444' : analysis.level >= 3 ? '#FB923C' : '#2DD4BF',
                      display: 'flex', alignItems: 'center', gap: 7
                    }}>
                      {analysis.level >= 5 ? <AlertCircle size={18} /> : <Heart size={18} />}
                      {analysis.level_name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
                      Confidence — {(analysis.confidence * 100).toFixed(1)}%
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.confidence * 100}%` }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #14B8A6, #8B5CF6)', borderRadius: 10 }}
                      />
                    </div>
                  </div>
                  {analysis.level >= 3 && (
                    <div style={{
                      marginTop: 14, padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)',
                      fontSize: 11, color: '#FB923C', lineHeight: 1.5
                    }}>
                      <ChevronRight size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Try asking: <em>"What should I do to feel better?"</em>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <MessageSquare size={28} color="#1E293B" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 11, color: '#475569' }}>Start chatting to see your mood analysis</div>
                </div>
              )}
            </div>

            {/* Privacy Note */}
            <div className="glass-card" style={{ padding: 18, background: 'rgba(20,184,166,0.04)', border: '1px solid rgba(20,184,166,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Shield size={14} color="#2DD4BF" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9' }}>100% Private</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                All analysis runs locally on your device. Nothing is stored or sent to external servers.
              </p>
            </div>

            {/* How to get recommendations hint */}
            <div className="glass-card" style={{ padding: 18, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', marginBottom: 8 }}>💬 Getting Advice</div>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Ask things like <em style={{ color: '#94A3B8' }}>"What should I do?"</em> or <em style={{ color: '#94A3B8' }}>"How can I feel better?"</em> to receive personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .typing-indicator {
          display: flex; padding: 12px 16px;
          background: rgba(30,41,59,0.85);
          border-radius: 18px 18px 18px 2px; gap: 4px;
        }
        .typing-indicator span {
          width: 6px; height: 6px; background: #475569;
          border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
