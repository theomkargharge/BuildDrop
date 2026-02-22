'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'developer' | 'tester'>('tester')
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!member) return
    const ws = member.workspaces as any
    setWorkspace({ ...ws, myRole: member.role })

    const { data: membersData } = await supabase
      .from('workspace_members')
      .select('*, profiles(name, avatar_url)')
      .eq('workspace_id', ws.id)

    const { data: invitesData } = await supabase
      .from('invitations')
      .select('*')
      .eq('workspace_id', ws.id)
      .eq('accepted', false)

    setMembers(membersData || [])
    setInvitations(invitesData || [])
    setLoading(false)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !workspace) return

    // Check if already invited or member
    const alreadyInvited = invitations.find(i => i.email === email)
    if (alreadyInvited) {
      setError('This email has already been invited')
      setInviting(false)
      return
    }

    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        workspace_id: workspace.id,
        email,
        role,
      })

    if (inviteError) {
      setError(inviteError.message)
    } else {
      setSuccess(`Invitation created for ${email}`)
      setEmail('')
      loadData()
    }
    setInviting(false)
  }

  async function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite/${token}`
    await navigator.clipboard.writeText(link)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  async function removeInvitation(id: string) {
    await supabase.from('invitations').delete().eq('id', id)
    loadData()
  }

  async function removeMember(id: string) {
    await supabase.from('workspace_members').delete().eq('id', id)
    loadData()
  }

  const roleColors: any = {
    owner: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    developer: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    tester: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading members...</p>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards', maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Members</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
          Manage your team and invite new members
        </p>
      </div>

      {/* Invite form */}
      <div className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>📨 Invite Member</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Generate an invite link to share with your team member
        </p>

        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              required
              style={{
                padding: '12px 16px', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text)', fontSize: '14px', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            {/* Role selector */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['developer', 'tester'] as const).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)} style={{
                  padding: '12px 16px', borderRadius: '10px', border: '1px solid',
                  borderColor: role === r ? roleColors[r].text : 'var(--border)',
                  background: role === r ? roleColors[r].bg : 'var(--surface-2)',
                  color: role === r ? roleColors[r].text : 'var(--text-muted)',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  textTransform: 'capitalize', transition: 'all 0.15s'
                }}>{r}</button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--danger)'
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              color: 'var(--success)'
            }}>{success}</div>
          )}

          <button type="submit" disabled={inviting} style={{
            padding: '12px 24px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px',
            fontWeight: '600', cursor: inviting ? 'not-allowed' : 'pointer',
            opacity: inviting ? 0.7 : 1, fontFamily: 'Syne, sans-serif',
            alignSelf: 'flex-start'
          }}>
            {inviting ? 'Creating...' : '+ Generate Invite Link'}
          </button>
        </form>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>
            ⏳ Pending Invitations
            <span style={{
              marginLeft: '10px', fontSize: '12px', fontWeight: '600',
              padding: '2px 8px', borderRadius: '20px',
              background: 'rgba(245,158,11,0.15)', color: '#fbbf24'
            }}>{invitations.length}</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invitations.map(inv => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '12px',
                background: 'var(--surface-2)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px'
                  }}>✉️</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{inv.email}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Invited {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    textTransform: 'capitalize',
                    background: roleColors[inv.role]?.bg,
                    color: roleColors[inv.role]?.text
                  }}>{inv.role}</span>

                  <button onClick={() => copyInviteLink(inv.token)} style={{
                    padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                    background: copied === inv.token ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
                    color: copied === inv.token ? 'var(--success)' : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    {copied === inv.token ? '✓ Copied' : 'Copy Link'}
                  </button>

                  <button onClick={() => removeInvitation(inv.id)} style={{
                    padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--danger)',
                    fontSize: '12px', cursor: 'pointer'
                  }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current members */}
      <div className="glass" style={{ borderRadius: '20px', padding: '28px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>
          👥 Team Members
          <span style={{
            marginLeft: '10px', fontSize: '12px', fontWeight: '600',
            padding: '2px 8px', borderRadius: '20px',
            background: 'rgba(99,102,241,0.15)', color: '#818cf8'
          }}>{members.length}</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {members.map(member => {
            const profile = member.profiles as any
            const initials = profile?.name
              ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
              : '?'
            const isOwner = member.role === 'owner'

            return (
              <div key={member.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '12px',
                background: 'var(--surface-2)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0
                  }}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                      : initials
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>
                      {profile?.name || 'Team Member'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    textTransform: 'capitalize',
                    background: roleColors[member.role]?.bg,
                    color: roleColors[member.role]?.text
                  }}>{member.role}</span>

                  {!isOwner && workspace?.myRole === 'owner' && (
                    <button onClick={() => removeMember(member.id)} style={{
                      padding: '7px 10px', borderRadius: '8px',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--danger)', fontSize: '12px', cursor: 'pointer'
                    }}>Remove</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}