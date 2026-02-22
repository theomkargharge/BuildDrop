'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const tagColors: any = {
  qa: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  staging: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  production: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  hotfix: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`, borderRadius: '50%'
      }} />
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      <p style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Syne, sans-serif', marginTop: '8px', color }}>{value}</p>
      <div style={{ fontSize: '20px', marginTop: '4px' }}>{icon}</div>
    </div>
  )
}

function BuildRow({ build }: any) {
  return (
    <Link href={`/dashboard/builds/${build.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderRadius: '12px', cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: '8px'
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>
            {build.apps?.platform === 'ios' ? '🍎' : '🤖'}
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{build.apps?.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              v{build.version_name} · Build #{build.build_number}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            background: tagColors[build.tag]?.bg || tagColors.qa.bg,
            color: tagColors[build.tag]?.text || tagColors.qa.text,
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>{build.tag}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date(build.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [apps, setApps] = useState<any[]>([])
  const [builds, setBuilds] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, workspaces(id, name)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (!memberData || !memberData.workspaces) {
   router.push('/create-workspace')
        return
      }

      const ws = memberData.workspaces as any
      setWorkspace(ws)

      const [appsRes, membersRes] = await Promise.all([
        supabase.from('apps').select('*').eq('workspace_id', ws.id),
        supabase.from('workspace_members').select('*').eq('workspace_id', ws.id)
      ])

      setApps(appsRes.data || [])
      setMembers(membersRes.data || [])

      if (appsRes.data?.length) {
        const appIds = appsRes.data.map((a: any) => a.id)
        const { data: buildsData } = await supabase
          .from('builds')
          .select('*, apps(name, platform)')
          .in('app_id', appIds)
          .order('created_at', { ascending: false })
          .limit(5)
        setBuilds(buildsData || [])
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your workspace...</p>
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Overview</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
            {workspace?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/dashboard/apps/new" style={{
          padding: '12px 20px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          borderRadius: '12px', color: 'white', textDecoration: 'none',
          fontSize: '14px', fontWeight: '600', fontFamily: 'Syne, sans-serif'
        }}>+ New App</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        <StatCard label="Total Apps" value={apps.length} icon="📱" color="#6366f1" />
        <StatCard label="Recent Builds" value={builds.length} icon="📦" color="#a855f7" />
        <StatCard label="Team Members" value={members.length} icon="👥" color="#22c55e" />
      </div>

      {/* Recent Builds */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Builds</h2>
          <Link href="/dashboard/apps" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {builds.length === 0 ? (
          <div className="glass" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No builds yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Create an app and upload your first build to get started
            </p>
            <Link href="/dashboard/apps/new" style={{
              padding: '11px 24px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              borderRadius: '10px', color: 'white', textDecoration: 'none',
              fontSize: '14px', fontWeight: '600'
            }}>Create your first app</Link>
          </div>
        ) : (
          <div>{builds.map(b => <BuildRow key={b.id} build={b} />)}</div>
        )}
      </div>

      {/* Apps Grid */}
      {apps.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Your Apps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {apps.map(app => (
              <Link key={app.id} href={`/dashboard/apps/${app.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass" style={{
                  borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                    {app.platform === 'ios' ? '🍎' : '🤖'}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{app.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {app.platform} · {app.bundle_id || 'No bundle ID'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}