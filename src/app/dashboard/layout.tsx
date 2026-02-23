'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: members } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(id, name)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (members?.workspaces) {
        const ws = members.workspaces as any
        setWorkspace(Array.isArray(ws) ? ws[0] : ws)
      }
    }
    load()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '⚡' },
    { href: '/dashboard/apps', label: 'Apps', icon: '📱' },
    { href: '/dashboard/members', label: 'Members', icon: '👥' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile top bar */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0,
        padding: '14px 20px', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', zIndex: 60,
        alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>📦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '16px' }}>BuildDrop</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', fontSize: '22px', padding: '4px'
        }}>{menuOpen ? '✕' : '☰'}</button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 55, display: 'none'
        }} className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px', minHeight: '100vh', padding: '24px 16px',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'var(--surface)', zIndex: 50, transition: 'transform 0.3s ease'
      }} className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div style={{ padding: '8px 12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>📦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px' }}>BuildDrop</span>
        </div>

        {workspace && (
          <div style={{
            padding: '10px 12px', borderRadius: '10px', marginBottom: '24px',
            background: 'var(--surface-2)', border: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Workspace</p>
            <p style={{ fontSize: '13px', fontWeight: '600' }}>{workspace.name}</p>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: active ? '600' : '400',
                  color: active ? 'white' : 'var(--text-muted)',
                  background: active ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{
          padding: '12px', borderRadius: '10px', border: '1px solid var(--border)',
          background: 'var(--surface-2)', display: 'flex', alignItems: 'center',
          gap: '10px', marginTop: '16px'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0
          }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
          </div>
          <button onClick={signOut} title="Sign out" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '16px'
          }}>→</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '40px', minHeight: '100vh' }}
        className="main-content">
        {children}
      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-bar { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .sidebar {
            transform: translateX(-100%);
            top: 0;
            padding-top: 80px;
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 80px 20px 40px !important;
          }
        }
      `}</style>
    </div>
  )
}