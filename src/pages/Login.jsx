import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export const Login = () => {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('admin@bakery.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validations
    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const success = login(email, password);
      setLoading(false);
      if (!success) {
        setError('Invalid email or password. Use: admin@bakery.com / admin123');
      }
    }, 1200);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--background)'
    }}>
      {/* Left Form Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 60px',
        backgroundColor: 'var(--surface)',
        zIndex: 2,
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <span style={{ fontSize: '38px', animation: 'float 3s ease-in-out infinite' }}>🍞</span>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)', lineHeight: 1.1 }}>BakeFlow</h2>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>Manufacturing ERP</span>
            </div>
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '8px', color: 'var(--text-main)' }}>Welcome Back</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Sign in to manage daily bakery batches, ingredients stock, and QC approvals.</p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--danger-light)',
                borderLeft: '4px solid var(--danger)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--danger)',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@bakery.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label className="checkbox-group" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Remember me</span>
              </label>

              <a href="#forgot" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); alert('Demo credentials: admin@bakery.com / admin123'); }}>
                Forgot password?
              </a>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: 'var(--border-radius-md)' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner" style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  <span>Signing in...</span>
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Test Credentials box */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: 'var(--background)',
            border: '1px dashed var(--surface-border)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '12px'
          }}>
            <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Demo Credentials:</h4>
            <div style={{ color: 'var(--text-muted)' }}>
              <strong>Email</strong>: admin@bakery.com <br/>
              <strong>Password</strong>: admin123
            </div>
          </div>
        </div>
      </div>

      {/* Right Graphic/Illustration Panel */}
      <div style={{
        flex: 1.2,
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Dynamic backdrop shapes */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          top: '-100px',
          right: '-100px'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          bottom: '-50px',
          left: '-50px'
        }} />

        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '20px'
          }}>
            v1.2.0 Stable Release
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '44px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            Optimize Your Bakery Production Operations
          </h1>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            opacity: 0.9,
            marginBottom: '32px'
          }}>
            Integrated recipes formulas, automatic ingredients stock subtraction, waste tracking, and real-time consumption comparison variance analytics in one unified dashboard.
          </p>

          {/* Graphical elements representing KPI or business summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>98.6%</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>QC Pass Rate</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>-12.4%</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Dough Material Variance</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Keyframe Injection for loading spin */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
