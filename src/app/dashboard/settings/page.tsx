'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [workspaceName, setWorkspaceName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingWorkspace, setSavingWorkspace] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [wsSuccess, setWsSuccess] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (profileData) {
      setProfile({ ...profileData, email: user.email })
      setDisplayName(profileData.name || '')
    }

    if (member?.workspaces) {
      const ws = member.workspaces as any
      setWorkspace({ ...ws, myRole: member.role })
      setWorkspaceName(ws.name)
    }

    setLoading(false)
  }

  async function saveWorkspace(e: React.FormEvent) {
    e.preventDefault()
    setSavingWorkspace(true)
    await supabase
      .from('workspaces')
      .update({ name: workspaceName })
      .eq('id', workspace.id)
    setSavingWorkspace(false)
    setWsSuccess(true)
    setTimeout(() => setWsSuccess(false), 2000)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ name: displayName })
      .eq('id', user.id)
    setSavingProfile(false)
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading settings...</p>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards', maxWidth: '640px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
          Manage your profile and workspace settings
        </p>
      </div>

      {/* Profile settings */}
      <div className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>👤 Your Profile</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          How you appear to your teammates
        </p>

        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '700', color: 'white'
            }}>
              {displayName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>{profile?.email}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Your account email
              </p>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Display Name
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%', marginTop: '8px', padding: '12px 16px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '10px', color: 'var(--text)', fontSize: '14px', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button type="submit" disabled={savingProfile} style={{
            padding: '11px 24px', alignSelf: 'flex-start',
            background: profileSuccess ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            border: profileSuccess ? '1px solid rgba(34,197,94,0.4)' : 'none',
            borderRadius: '10px', color: profileSuccess ? 'var(--success)' : 'white',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', transition: 'all 0.2s'
          }}>
            {profileSuccess ? '✓ Saved!' : savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Workspace settings */}
      {workspace?.myRole === 'owner' && (
        <div className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>🏢 Workspace</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Settings for your workspace
          </p>

          <form onSubmit={saveWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Workspace Name
              </label>
              <input
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                placeholder="Your workspace name"
                style={{
                  width: '100%', marginTop: '8px', padding: '12px 16px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={savingWorkspace} style={{
              padding: '11px 24px', alignSelf: 'flex-start',
              background: wsSuccess ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              border: wsSuccess ? '1px solid rgba(34,197,94,0.4)' : 'none',
              borderRadius: '10px', color: wsSuccess ? 'var(--success)' : 'white',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', transition: 'all 0.2s'
            }}>
              {wsSuccess ? '✓ Saved!' : savingWorkspace ? 'Saving...' : 'Save Workspace'}
            </button>
          </form>
        </div>
      )}

      {/* Account actions */}
      <div className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>🔐 Account</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Manage your account access
        </p>

        <button onClick={signOut} style={{
          padding: '11px 24px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
          fontWeight: '600', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
        >
          Sign Out →
        </button>
      </div>

      {/* Danger zone */}
      <div style={{
        borderRadius: '20px', padding: '28px',
        border: '1px solid rgba(239,68,68,0.3)',
        background: 'rgba(239,68,68,0.03)'
      }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px', color: 'var(--danger)' }}>
          ⚠️ Danger Zone
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          These actions are irreversible. Please be careful.
        </p>

        {!showDanger ? (
          <button onClick={() => setShowDanger(true)} style={{
            padding: '11px 24px',
            background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px', color: 'var(--danger)', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer'
          }}>
            Delete Workspace
          </button>
        ) : (
          <div style={{
            padding: '20px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)'
          }}>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text)' }}>
              Are you sure? This will permanently delete your workspace, all apps, and all builds.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDanger(false)} style={{
                padding: '10px 20px', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text)', fontSize: '14px', cursor: 'pointer'
              }}>Cancel</button>
              <button style={{
                padding: '10px 20px', background: 'var(--danger)',
                border: 'none', borderRadius: '10px',
                color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}