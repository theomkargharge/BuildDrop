'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewAppPage() {
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<'android' | 'ios'>('android')
  const [bundleId, setBundleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!member) { setError('No workspace found'); setLoading(false); return }

    const { data: app, error: appError } = await supabase
      .from('apps')
      .insert({ name, platform, bundle_id: bundleId, workspace_id: member.workspace_id })
      .select()
      .single()

    if (appError) { setError(appError.message); setLoading(false); return }

    router.push(`/dashboard/apps/${app.id}`)
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards', maxWidth: '560px' }}>
      {/* Back */}
      <Link href="/dashboard/apps" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '32px'
      }}>
        ← Back to Apps
      </Link>

      <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
        New App
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
        Add an app to start uploading builds
      </p>

      <div className="glass" style={{ borderRadius: '20px', padding: '32px' }}>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Platform selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
              Platform
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(['android', 'ios'] as const).map(p => (
                <button key={p} type="button" onClick={() => setPlatform(p)} style={{
                  padding: '16px', borderRadius: '12px', border: '2px solid',
                  borderColor: platform === p ? 'var(--accent)' : 'var(--border)',
                  background: platform === p ? 'rgba(99,102,241,0.1)' : 'var(--surface-2)',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ fontSize: '28px' }}>{p === 'ios' ? '🍎' : '🤖'}</span>
                  <span style={{
                    fontSize: '13px', fontWeight: '600', textTransform: 'capitalize',
                    color: platform === p ? 'var(--accent)' : 'var(--text-muted)'
                  }}>{p === 'ios' ? 'iOS' : 'Android'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* App name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              App Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. My Awesome App"
              required
              style={{
                width: '100%', marginTop: '8px', padding: '13px 16px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '10px', color: 'var(--text)', fontSize: '15px', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Bundle ID */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Bundle ID <span style={{ color: 'var(--border)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              value={bundleId}
              onChange={e => setBundleId(e.target.value)}
              placeholder={platform === 'ios' ? 'com.company.appname' : 'com.company.appname'}
              style={{
                width: '100%', marginTop: '8px', padding: '13px 16px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '10px', color: 'var(--text)', fontSize: '15px', outline: 'none',
                fontFamily: 'monospace'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--danger)'
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '14px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, fontFamily: 'Syne, sans-serif', letterSpacing: '0.3px'
          }}>
            {loading ? 'Creating...' : 'Create App →'}
          </button>
        </form>
      </div>
    </div>
  )
}