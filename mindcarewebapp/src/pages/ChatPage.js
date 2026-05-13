import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, AlertCircle, 
  MessageSquare, Trash2, Shield, Heart
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: '1', type: 'bot', text: "Hello! I'm your MindCare Companion. I'm here to listen and support you. How are you feeling today?", time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      time: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: data.reply,
          time: new Date(),
          analysis: data.analysis
        }]);
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        isError: true,
        time: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([{ id: '1', type: 'bot', text: "Hello again! How can I support you now?", time: new Date() }]);
      setAnalysis(null);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 50%), var(--bg-900)',
      paddingTop: 100,
      paddingBottom: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div className="noise-overlay" />
      
      <div className="container" style={{ maxWidth: 900, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, height: '75vh' }}>
          
          {/* Main Chat Window */}
          <div className="glass-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(15,23,42,0.6)'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 12, 
                  background: 'linear-gradient(135deg, #14B8A6, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>MindCare Companion</div>
                  <div style={{ fontSize: 11, color: '#2DD4BF', fontWeight: 600 }}>Always here to listen</div>
                </div>
              </div>
              <button 
                onClick={clearChat}
                style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer' }}
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{
                      alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: msg.type === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: msg.type === 'user' 
                        ? 'linear-gradient(135deg, #0D9488, #0F766E)' 
                        : 'rgba(30,41,59,0.8)',
                      color: msg.type === 'user' ? '#fff' : '#CBD5E1',
                      fontSize: 14,
                      lineHeight: 1.5,
                      boxShadow: msg.type === 'user' ? '0 4px 12px rgba(13,148,136,0.2)' : 'none',
                      border: msg.type === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {msg.type === 'bot' && <Sparkles size={10} color="#2DD4BF" />}
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSend}
              style={{ 
                padding: '20px', 
                background: 'rgba(255,255,255,0.02)', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                gap: 12
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  color: '#F1F5F9',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="btn-primary"
                style={{ padding: '0 20px', borderRadius: 12, opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Sidebar - Analysis & Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Analysis Card */}
            <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(45,212,191,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Sparkles size={18} color="#2DD4BF" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Real-time Analysis</span>
              </div>
              
              {analysis ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Detected Mood</div>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: 900, 
                      color: analysis.level >= 4 ? '#EF4444' : '#2DD4BF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {analysis.level >= 4 ? <AlertCircle size={20} /> : <Heart size={20} />}
                      {analysis.level_name}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>AI Confidence</div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.confidence * 100}%` }}
                        style={{ 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #14B8A6, #8B5CF6)',
                          borderRadius: 10
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <MessageSquare size={32} color="#1E293B" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 12, color: '#475569' }}>Start chatting to see emotional analysis</div>
                </div>
              )}
            </div>

            {/* Privacy/Safety Note */}
            <div className="glass-card" style={{ padding: 20, background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Shield size={16} color="#2DD4BF" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F1F5F9' }}>Privacy First</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                This is a local AI analysis. Your conversations are private and never stored on our servers.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .typing-indicator {
          display: flex;
          padding: 12px 16px;
          background: rgba(30,41,59,0.8);
          border-radius: 18px 18px 18px 2px;
          gap: 4px;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: #475569;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
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
