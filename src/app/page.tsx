import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>📦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px' }}>BuildDrop</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" style={{
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
      <div style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative' }}>
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
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{
            padding: '15px 36px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: 'white', textDecoration: 'none', fontSize: '16px',
            fontWeight: '700', fontFamily: 'Syne, sans-serif',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)'
          }}>
            Start for Free →
          </Link>
          <Link href="/login" style={{
            padding: '15px 36px', borderRadius: '14px',
            border: '1px solid var(--border)', color: 'var(--text)',
            textDecoration: 'none', fontSize: '16px', fontWeight: '500'
          }}>
            See how it works
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '16px' }}>
            Everything your team needs
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            From upload to install in seconds. No more hunting for the latest build.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { icon: '⬆️', title: 'Upload & Share Instantly', desc: 'Drag and drop your APK or paste your TestFlight link. Get a shareable URL in seconds.' },
            { icon: '📱', title: 'QR Code for Every Build', desc: 'Every build gets a QR code. Testers scan and install directly — no emails needed.' },
            { icon: '🔔', title: 'Team Notifications', desc: 'Your entire team gets notified the moment a new build is uploaded. No more "hey did you get the build?"' },
            { icon: '🏷️', title: 'Organize with Tags', desc: 'Tag builds as QA, Staging, Production, or Hotfix. Always know what stage a build is at.' },
            { icon: '📊', title: 'Build History', desc: 'Every build is archived with its version, release notes, and download count. Full history at a glance.' },
            { icon: '👥', title: 'Team Workspaces', desc: 'Invite developers and testers. Control who can upload and who can only download.' },
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
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto', padding: '60px 48px',
          borderRadius: '28px', background: 'var(--surface)',
          border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
        }}>
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
          }}>
            Get Started Free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '24px 48px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📦</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px' }}>BuildDrop</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Built for mobile dev teams</p>
      </div>
    </div>
  )
}