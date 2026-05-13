import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Assessment', href: '/assessment' },
    { label: 'Reddit Analysis', href: '/reddit' },
    { label: 'X Analysis', href: '/twitter' },
    { label: 'AI Companion', href: '/chat' },
  ];

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.slice(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      padding: scrolled ? '12px 0' : '20px 0',
      background: scrolled ? 'rgba(6, 11, 20, 0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #14B8A6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(20,184,166,0.4)',
          }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.02em', lineHeight: 1 }}>MindCare</div>
            <div style={{ fontSize: 9, color: '#2DD4BF', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI Companion</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(({ label, href }) => {
            const isActive = location.pathname === href;
            const isSpecial = label === 'Assessment' || label === 'AI Companion';
            return (
              <Link
                key={label}
                to={href}
                onClick={(e) => {
                  if (href.startsWith('/#')) handleNavClick(e, href);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#2DD4BF' : '#94A3B8',
                  background: isActive ? 'rgba(45,212,191,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(45,212,191,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#F1F5F9';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/assessment">
            <button className="btn-primary" style={{ padding: '10px 22px', fontSize: 13 }}>
              <Sparkles size={14} />
              Try Free
            </button>
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 8 }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(6,11,20,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 20px',
        }}>
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              style={{
                display: 'block',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: 15,
                fontWeight: 500,
                color: '#94A3B8',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
