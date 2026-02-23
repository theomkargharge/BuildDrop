'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AppsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      if (!member) return
      const { data: appsData } = await supabase
        .from('apps')
        .select('*')
        .eq('workspace_id', member.workspace_id)
        .order('created_at', { ascending: false })
      setApps(appsData || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading apps...</p>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Apps</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>Manage your apps and their builds</p>
        </div>
        <Link href="/dashboard/apps/new" style={{
          padding: '12px 20px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          borderRadius: '12px', color: 'white', textDecoration: 'none',
          fontSize: '14px', fontWeight: '600', fontFamily: 'Syne, sans-serif'
        }}>+ New App</Link>
      </div>
      {apps.length === 0 ? (
        <div className="glass" style={{ borderRadius: '20px', padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>📱</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>No apps yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>Add your first app to start uploading and sharing builds</p>
          <Link href="/dashboard/apps/new" style={{
            padding: '12px 28px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: '12px', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600'
          }}>Create your first app</Link>
        </div>
      ) : (
    <div className="responsive-grid-apps">
          {apps.map(app => (
            <Link key={app.id} href={`/dashboard/apps/${app.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass" style={{
                borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{app.platform === 'ios' ? '🍎' : '🤖'}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>{app.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{app.bundle_id || 'No bundle ID'}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: app.platform === 'ios' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
                    color: app.platform === 'ios' ? '#818cf8' : '#4ade80'
                  }}>{app.platform}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
