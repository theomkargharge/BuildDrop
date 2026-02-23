import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      <style>{`
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(10,10,15,0.8); backdrop-filter: blur(12px); z-index: 50; }
        .nav-buttons { display: flex; gap: 12px; }
        .hero { text-align: center; padding: 100px 24px 80px; position: relative; }
        .hero-buttons { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .features-section { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .cta-section { padding: 80px 48px; text-align: center; }
        .cta-box { max-width: 600px; margin: 0 auto; padding: 60px 48px; border-radius: 28px; background: var(--surface); border: 1px solid var(--border); position: relative; overflow: hidden; }
        .footer { padding: 24px 48px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav-buttons .hide-mobile { display: none; }
          .hero { padding: 60px 20px 40px; }
          .hero h1 { font-size: 42px !important; letter-spacing: -1px !important; }
          .hero p { font-size: 16px !important; }
          .features-section { padding: 40px 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 40px 20px; }
          .cta-box { padding: 40px 24px; }
          .cta-box h2 { font-size: 28px !important; }
          .footer { padding: 20px; flex-direction: column; gap: 12px; text-align: center; }
        }

        @media (max-width: 480px) {
          .hero h1 { font-size: 34px !important; }
          .hero-buttons a { width: 100%; text-align: center; }
          .hero-buttons { flex-direction: column; align-items: center; }
        }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>📦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px' }}>BuildDrop</span>
        </div>
        <div className="nav-buttons">
          <Link href="/login" className="hide-mobile" style={{
            padding: '9px 20px', borderRadius: '10px',
            border: '1px solid var(--border)', color: 'var(--text)',
            textDecoration: 'none', fontSize: '14px', fontWeight: '500'
          }}>Sign In</Link>
          <Link href="/login" style={{
            padding: '9px 20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
            fontFamily: 'Syne, sans-serif'
          }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '20px', marginBottom: '32px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          fontSize: '13px', color: '#818cf8', fontWeight: '500'
        }}>
          ✨ Built for mobile dev teams
        </div>
        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: '800',
          letterSpacing: '-2px', lineHeight: '1.05', marginBottom: '24px',
          background: 'linear-gradient(135deg, #ffffff 40%, #6b6b80)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Ship builds.<br />Notify teams.<br />Instantly.
        </h1>
        <p style={{
          fontSize: '18px', color: 'var(--text-muted)', maxWidth: '520px',
          margin: '0 auto 48px', lineHeight: '1.6'
        }}>
          Stop sharing APKs over Slack and TestFlight links over email.
          BuildDrop organizes your builds and notifies your team automatically.
        </p>
        <div className="hero-buttons">
          <Link href="/login" style={{
            padding: '15px 36px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'white', textDecoration: 'none', fontSize: '16px',
            fontWeight: '700', fontFamily: 'Syne, sans-serif',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)'
          }}>Start for Free →</Link>
          <Link href="/login" style={{
            padding: '15px 36px', borderRadius: '14px',
            border: '1px solid var(--border)', color: 'var(--text)',
            textDecoration: 'none', fontSize: '16px', fontWeight: '500'
          }}>See how it works</Link>
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '800', letterSpacing: '-1px', marginBottom: '16px' }}>
            Everything your team needs
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            From upload to install in seconds. No more hunting for the latest build.
          </p>
        </div>
        <div className="features-grid">
          {[
            { icon: '⬆️', title: 'Upload & Share Instantly', desc: 'Drag and drop your APK or paste your TestFlight link. Get a shareable URL in seconds.' },
            { icon: '📱', title: 'QR Code for Every Build', desc: 'Every build gets a QR code. Testers scan and install directly — no emails needed.' },
            { icon: '🔔', title: 'Team Notifications', desc: 'Your entire team gets notified the moment a new build is uploaded.' },
            { icon: '🏷️', title: 'Organize with Tags', desc: 'Tag builds as QA, Staging, Production, or Hotfix. Always know what stage a build is at.' },
            { icon: '📊', title: 'Build History', desc: 'Every build is archived with version, release notes, and download count.' },
            { icon: '👥', title: 'Team Workspaces', desc: 'Invite developers and testers. Control who can upload and who can download.' },
          ].map((f, i) => (
            <div key={i} className="glass" style={{ borderRadius: '20px', padding: '28px' }}>
              <div style={{
                fontSize: '28px', marginBottom: '16px', width: '52px', height: '52px',
                borderRadius: '14px', background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-box">
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '200px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none'
          }} />
          <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '16px' }}>
            Ready to ship faster?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
            Free to start. No credit card required.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', padding: '15px 40px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'white', textDecoration: 'none', fontSize: '16px',
            fontWeight: '700', fontFamily: 'Syne, sans-serif'
          }}>Get Started Free →</Link>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📦</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px' }}>BuildDrop</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Built for mobile dev teams</p>
      </div>
    </div>
  )
}