'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'

const tagColors: any = {
  qa: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  staging: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  production: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  hotfix: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

export default function BuildDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [build, setBuild] = useState<any>(null)
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const installUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/install/${id}`
    : ''

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    const { data: buildData } = await supabase
      .from('builds')
      .select('*, apps(*)')
      .eq('id', id)
      .single()

    if (buildData) {
      setBuild(buildData)
      setApp(buildData.apps)

      const url = `${window.location.origin}/install/${id}`
      const qr = await QRCode.toDataURL(url, {
        width: 200, margin: 2,
        color: { dark: '#ffffff', light: '#111118' }
      })
      setQrUrl(qr)
    }
    setLoading(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(installUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatBytes(bytes: number) {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading build...</p>
    </div>
  )

  if (!build) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <p style={{ color: 'var(--text-muted)' }}>Build not found</p>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards', maxWidth: '900px' }}>
      <Link href={`/dashboard/apps/${app?.id}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '32px'
      }}>← Back to {app?.name}</Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
        }}>📦</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              v{build.version_name}
            </h1>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              background: tagColors[build.tag]?.bg || tagColors.qa.bg,
              color: tagColors[build.tag]?.text || tagColors.qa.text
            }}>{build.tag}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            {app?.name} · Build #{build.build_number} · {new Date(build.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Share link */}
          <div className="glass" style={{ borderRadius: '20px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>📎 Share Link</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Share this link with your team to download or install this build
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                flex: 1, padding: '12px 16px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: 'monospace'
              }}>{installUrl}</div>
              <button onClick={copyLink} style={{
                padding: '12px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: copied ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: copied ? 'var(--success)' : 'white',
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                whiteSpace: 'nowrap', fontFamily: 'Syne, sans-serif'
              }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Download / TestFlight */}
          <div className="glass" style={{ borderRadius: '20px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
              {app?.platform === 'android' ? '🤖 Download Build' : '🍎 TestFlight'}
            </h2>
            {app?.platform === 'android' ? (
              <a href={build.file_url} download style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '14px 24px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white', textDecoration: 'none',
                fontSize: '15px', fontWeight: '600', fontFamily: 'Syne, sans-serif'
              }}>
                ⬇️ Download APK · {formatBytes(build.file_size)}
              </a>
            ) : (
              <a href={build.testflight_link} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '14px 24px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: 'white', textDecoration: 'none',
                fontSize: '15px', fontWeight: '600', fontFamily: 'Syne, sans-serif'
              }}>
                Open in TestFlight →
              </a>
            )}
          </div>

          {/* Build info */}
          <div className="glass" style={{ borderRadius: '20px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📋 Build Info</h2>
            {[
              { label: 'App', value: app?.name },
              { label: 'Platform', value: app?.platform?.toUpperCase() },
              { label: 'Version', value: build.version_name },
              { label: 'Build Number', value: `#${build.build_number}` },
              { label: 'Tag', value: build.tag?.toUpperCase() },
              { label: 'File Size', value: formatBytes(build.file_size) },
              { label: 'Uploaded', value: new Date(build.created_at).toLocaleString() },
            ].map((item, i, arr) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Release notes */}
          {build.release_notes && (
            <div className="glass" style={{ borderRadius: '20px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📝 Release Notes</h2>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {build.release_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right column — QR */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass" style={{ borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>📱 Scan to Install</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Scan with your phone camera
            </p>
            {qrUrl ? (
              <div style={{
                display: 'inline-block', padding: '16px',
                background: 'var(--surface-2)', borderRadius: '16px',
                border: '1px solid var(--border)'
              }}>
                <img src={qrUrl} alt="QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
              </div>
            ) : (
              <div style={{
                width: '180px', height: '180px', margin: '0 auto',
                background: 'var(--surface-2)', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '13px'
              }}>Generating...</div>
            )}
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
              Points to the install page
            </p>
          </div>

          <div className="glass" style={{ borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Downloads</span>
              <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}>
                {build.download_count || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}