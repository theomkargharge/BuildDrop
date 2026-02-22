'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateWorkspacePage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

async function handleCreate(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { setError('Not logged in'); setLoading(false); return }

  console.log('Creating workspace for user:', user.id)

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: user.id })
    .select()
    .single()

  console.log('Workspace result:', workspace, wsError)

  if (wsError) { setError(wsError.message); setLoading(false); return }

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner'
    })

  console.log('Member insert error:', memberError)

if (memberError) { setError(memberError.message); setLoading(false); return }

  router.refresh()
  router.push('/dashboard')
}

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '30%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '460px', animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Create your workspace</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
            A workspace holds all your apps, builds and team members
          </p>
        </div>

        <div className="glass" style={{ borderRadius: '20px', padding: '32px' }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Workspace Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Mobile Team"
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

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--danger)'
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '13px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'Syne, sans-serif'
            }}>
              {loading ? 'Creating...' : 'Create Workspace →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}