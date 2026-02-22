'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function InvitePage() {
  const params = useParams()
  const token = params.token as string
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadInvite() }, [token])

  async function loadInvite() {
    const { data } = await supabase
      .from('invitations')
      .select('*, workspaces(name)')
      .eq('token', token)
      .eq('accepted', false)
      .maybeSingle()

    setInvitation(data)
    setLoading(false)
  }

  async function handleAccept() {
    setAccepting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?redirect=/invite/${token}`)
      return
    }

    if (!invitation) { setError('Invitation not found or expired'); setAccepting(false); return }

    // Add to workspace
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: invitation.role
      })

    if (memberError && !memberError.message.includes('duplicate')) {
      setError(memberError.message)
      setAccepting(false)
      return
    }

    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ accepted: true })
      .eq('token', token)

    router.push('/dashboard')
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading invitation...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>You&apos;re invited!</h1>
        </div>

        <div className="glass" style={{ borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
          {!invitation ? (
            <>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>😕</div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                Invitation not found
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                This invite link may have expired or already been used.
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', margin: '0 auto 20px'
              }}>📦</div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
                {(invitation.workspaces as any)?.name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                You&apos;ve been invited to join as
              </p>
              <span style={{
                display: 'inline-block', padding: '4px 16px', borderRadius: '20px',
                fontSize: '13px', fontWeight: '600', textTransform: 'capitalize',
                background: 'rgba(99,102,241,0.15)', color: '#818cf8', marginBottom: '28px'
              }}>
                {invitation.role}
              </span>

              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--danger)'
                }}>{error}</div>
              )}

              <button onClick={handleAccept} disabled={accepting} style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '15px', fontWeight: '600', cursor: accepting ? 'not-allowed' : 'pointer',
                opacity: accepting ? 0.7 : 1, fontFamily: 'Syne, sans-serif'
              }}>
                {accepting ? 'Joining...' : 'Accept Invitation →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}