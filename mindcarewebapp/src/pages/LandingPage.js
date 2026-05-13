import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, Shield, Activity, BarChart2, ChevronRight,
  Zap, Lock, ArrowRight, CheckCircle2, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

function HeroSection({ onTry }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(139,92,246,0.1) 0%, transparent 60%), var(--bg-900)',
      padding: '120px 20px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center',
    }}>
      <div className="orb orb-teal" style={{ width: 500, height: 500, top: -100, left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }} />
      <div className="orb orb-violet" style={{ width: 400, height: 400, bottom: -80, right: -100, opacity: 0.2 }} />
      <div className="noise-overlay" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp}>
            <span className="label-tag" style={{ marginBottom: 24, display: 'inline-flex' }}>
              <Sparkles size={11} /> FAST-NUCES FYP · AI-Powered Assessment
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1.05, marginBottom: 24, color: '#F1F5F9',
          }}>
            Mental Health{' '}
            <span className="text-gradient">
              AI Analysis
            </span>
            <br />for Students
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: '#94A3B8',
            maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Semantic & temporal analysis of text using SBERT + BiLSTM ensemble models.
            8-level severity classification with SHAP explainability.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onTry} style={{ fontSize: 15, padding: '15px 32px' }}>
              <Brain size={18} /> Try the Assessment
            </button>
            <a href="#how-it-works">
              <button className="btn-secondary" style={{ fontSize: 15 }}>
                How it works <ChevronRight size={16} />
              </button>
            </a>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { val: '92%+', label: 'Accuracy Target' },
              { val: '8', label: 'Severity Levels' },
              { val: '81K+', label: 'Training Samples' },
              { val: '4', label: 'Fusion Models' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#2DD4BF' }}>{val}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating UI preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ marginTop: 64, animation: 'float 4s ease-in-out infinite' }}
        >
          <div className="glass-card" style={{
            maxWidth: 520, margin: '0 auto', padding: 24,
            background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(45,212,191,0.2)',
            boxShadow: '0 0 60px rgba(20,184,166,0.15), 0 40px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>LIVE ANALYSIS · SBERT + BiLSTM Ensemble</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#94A3B8', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
              "I have three exams next week and I'm completely <mark style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', padding: '1px 3px', borderRadius: 3 }}>overwhelmed</mark> with the workload..."
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Severity Level</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#F97316' }}>🔶 Severe Stress</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confidence</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#2DD4BF' }}>86.4%</div>
              </div>
            </div>
            <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '62%', background: 'linear-gradient(90deg, #14B8A6, #F97316)', borderRadius: 99 }} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Brain, color: '#2DD4BF', title: 'SBERT + BiLSTM Ensemble', desc: 'Gated fusion of sentence embeddings and bidirectional LSTM with self-attention. Targets >92% classification accuracy.' },
    { icon: BarChart2, color: '#A78BFA', title: 'SHAP / LIME Explainability', desc: 'Every prediction includes keyword highlights and a plain-language decision trace so clinicians can verify the AI\'s reasoning.' },
    { icon: Activity, color: '#34D399', title: '8-Level Severity Framework', desc: 'From Normal to Depression Risk (Urgent), each level maps to a specific intervention protocol aligned with clinical guidelines.' },
    { icon: Shield, color: '#FB7185', title: 'PHQ-9 & GAD-7 Scoring', desc: 'Standardised clinical instruments integrated directly into the platform for multi-modal mental health assessment.' },
    { icon: Zap, color: '#FBBF24', title: 'Real-Time Crisis Detection', desc: 'Keyword override with negation detection raises alert levels instantly when crisis indicators are found in text.' },
    { icon: Lock, color: '#60A5FA', title: 'Privacy by Design', desc: 'AES-256 encryption, TLS 1.3, GDPR & HIPAA aligned. No inference data is retained after prediction.' },
  ];

  return (
    <section id="features" className="section" style={{ background: 'var(--bg-800)' }}>
      <div className="orb orb-violet" style={{ width: 600, height: 600, top: -100, right: -150, opacity: 0.12, position: 'absolute' }} />
      <div className="noise-overlay" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          className="section-header"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}
        >
          <motion.span variants={fadeUp} className="label-tag"><Star size={11} /> Core Capabilities</motion.span>
          <motion.h2 variants={fadeUp} style={{ marginTop: 12 }}>Built for <span className="text-gradient">clinical precision</span></motion.h2>
          <motion.p variants={fadeUp}>Four neural networks fused into a single, explainable pipeline — designed for student mental health in real-world deployments.</motion.p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
        >
          {features.map(({ icon: Icon, color, title, desc }) => (
            <motion.div key={title} variants={fadeUp} className="glass-card" style={{ padding: 28 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                background: `rgba(${hexToRgbStr(color)}, 0.1)`,
                border: `1px solid rgba(${hexToRgbStr(color)}, 0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>{desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '01', color: '#2DD4BF', title: 'Input Your Text', desc: 'Paste a social media post, journal entry, or any free-form text into the analysis box.' },
    { num: '02', color: '#A78BFA', title: 'AI Inference', desc: 'The SBERT encoder generates sentence embeddings fed into the BiLSTM + Attention classifier.' },
    { num: '03', color: '#34D399', title: 'Crisis Check', desc: 'A keyword override layer scans for crisis indicators with negation detection before finalising the level.' },
    { num: '04', color: '#FBBF24', title: 'Explainable Result', desc: 'Receive a severity level, confidence score, SHAP-highlighted keywords, and an intervention recommendation.' },
  ];

  return (
    <section id="how-it-works" className="section" style={{ background: 'var(--bg-900)' }}>
      <div className="orb orb-teal" style={{ width: 500, height: 500, bottom: -100, left: -100, opacity: 0.1, position: 'absolute' }} />
      <div className="noise-overlay" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div className="section-header" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.span variants={fadeUp} className="label-tag"><Zap size={11} /> Process</motion.span>
          <motion.h2 variants={fadeUp} style={{ marginTop: 12 }}>How it <span className="text-gradient">works</span></motion.h2>
          <motion.p variants={fadeUp}>From raw text to clinical recommendation in under two seconds.</motion.p>
        </motion.div>

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ position: 'absolute', left: 36, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #14B8A6, #8B5CF6, #34D399, #FBBF24)', opacity: 0.3, borderRadius: 2 }} />

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {steps.map(({ num, color, title, desc }) => (
              <motion.div key={num} variants={fadeUp} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingLeft: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0, zIndex: 1,
                  background: `rgba(${hexToRgbStr(color)}, 0.12)`,
                  border: `2px solid rgba(${hexToRgbStr(color)}, 0.3)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 900, color,
                }}>
                  {num}
                </div>
                <div className="glass-card" style={{ flex: 1, padding: '20px 24px', borderRadius: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LevelsSection() {
  const levels = [
    { level: 0, name: 'Normal', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', icon: '✅', intervention: 'No intervention' },
    { level: 1, name: 'Mild Stress', color: '#84CC16', bg: 'rgba(132,204,22,0.08)', icon: '🟡', intervention: 'Self-help resources' },
    { level: 2, name: 'Moderate Stress', color: '#EAB308', bg: 'rgba(234,179,8,0.08)', icon: '🟠', intervention: 'Wellness workshop' },
    { level: 3, name: 'Severe Stress', color: '#F97316', bg: 'rgba(249,115,22,0.08)', icon: '🔶', intervention: 'Counselling referral' },
    { level: 4, name: 'Mild Anxiety', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: '🔴', intervention: 'Relaxation + counselling' },
    { level: 5, name: 'Moderate Anxiety', color: '#DC2626', bg: 'rgba(220,38,38,0.08)', icon: '🚨', intervention: 'Immediate CBT' },
    { level: 6, name: 'Suicidal Ideation', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', icon: '⚠️', intervention: 'Urgent referral' },
    { level: 7, name: 'Depression Risk', color: '#FB7185', bg: 'rgba(251,113,133,0.08)', icon: '🆘', intervention: 'Crisis intervention' },
  ];

  return (
    <section id="about" className="section" style={{ background: 'var(--bg-800)' }}>
      <div className="noise-overlay" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div className="section-header" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.span variants={fadeUp} className="label-tag"><Activity size={11} /> Classification Framework</motion.span>
          <motion.h2 variants={fadeUp} style={{ marginTop: 12 }}>8-Level <span className="text-gradient">Severity Scale</span></motion.h2>
          <motion.p variants={fadeUp}>Each level maps to a specific clinical intervention, from self-help resources to immediate crisis support.</motion.p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}
        >
          {levels.map(({ level, name, color, bg, icon, intervention }) => (
            <motion.div key={level} variants={fadeUp} style={{
              background: bg, border: `1px solid ${color}22`, borderRadius: 16, padding: '18px 20px',
              transition: 'all 0.2s', cursor: 'default',
            }}
              whileHover={{ scale: 1.03, boxShadow: `0 0 24px ${color}22` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '3px 8px', borderRadius: 99 }}>L{level}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{intervention}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection({ onTry }) {
  return (
    <section className="section" style={{ background: 'var(--bg-900)', padding: '80px 20px' }}>
      <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{
          maxWidth: 680, margin: '0 auto', padding: '60px 40px',
          background: 'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(45,212,191,0.2)', borderRadius: 28,
          boxShadow: '0 0 80px rgba(20,184,166,0.08)',
        }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ fontSize: 40, marginBottom: 12 }}>🧠</motion.div>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 14, color: '#F1F5F9' }}>
              Start your assessment
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, color: '#64748B', marginBottom: 32, lineHeight: 1.7 }}>
              No account needed. Try the full analysis pipeline free — including PHQ-9, GAD-7, and AI text analysis.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={onTry} style={{ fontSize: 15, padding: '15px 32px' }}>
                <Brain size={18} /> Try Now — It's Free <ArrowRight size={16} />
              </button>
            </motion.div>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              {['No sign-up required', 'Demo mode available', 'SHAP explanations'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
                  <CheckCircle2 size={13} color="#2DD4BF" /> {f}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function hexToRgbStr(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goToApp = () => navigate('/assessment');

  return (
    <div>
      <HeroSection onTry={goToApp} />
      <FeaturesSection />
      <HowItWorksSection />
      <LevelsSection />
      <CTASection onTry={goToApp} />
    </div>
  );
}
