'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import JSZip from 'jszip'

const tagColors: any = {
  qa: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  staging: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  production: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  hotfix: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

// Parse version from APK (ZIP) file
async function parseApkMetadata(file: File): Promise<{ versionName: string, versionCode: string }> {
  try {
    const zip = await JSZip.loadAsync(file)
    const manifestFile = zip.file('AndroidManifest.xml')
    if (!manifestFile) return { versionName: '', versionCode: '' }

    const buffer = await manifestFile.async('arraybuffer')
    const bytes = new Uint8Array(buffer)

    // Parse binary AndroidManifest.xml for versionName and versionCode
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    // Extract version strings from binary XML
    let versionName = ''
    let versionCode = ''

    // Look for version patterns in the binary content
    const versionNameMatch = text.match(/(\d+\.\d+[\.\d]*)/g)
    const versionCodeMatch = text.match(/versionCode[^\d]*(\d+)/i)

    if (versionNameMatch) versionName = versionNameMatch[0]
    if (versionCodeMatch) versionCode = versionCodeMatch[1]

    // Better approach: scan bytes for version string
    // versionName is stored as a UTF-16 string in binary manifest
    let extractedVersion = ''
    for (let i = 0; i < bytes.length - 4; i++) {
      if (bytes[i] === 0x76 && bytes[i+1] === 0x65 && bytes[i+2] === 0x72) { // 'ver'
        // Found potential version string marker, scan forward for x.x.x pattern
        const chunk = text.slice(Math.max(0, i - 50), i + 100)
        const match = chunk.match(/\d+\.\d+\.?\d*/)
        if (match) { extractedVersion = match[0]; break }
      }
    }

    return {
      versionName: extractedVersion || versionName || '',
      versionCode: versionCode || ''
    }
  } catch {
    return { versionName: '', versionCode: '' }
  }
}

export default function AppDetailPage() {
  const { id } = useParams()
  const [app, setApp] = useState<any>(null)
  const [builds, setBuilds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    const { data: appData } = await supabase.from('apps').select('*').eq('id', id).single()
    setApp(appData)
    const { data: buildsData } = await supabase
      .from('builds').select('*').eq('app_id', id)
      .order('created_at', { ascending: false })
    setBuilds(buildsData || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )

  if (!app) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <p style={{ color: 'var(--text-muted)' }}>App not found</p>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
      <Link href="/dashboard/apps" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '32px'
      }}>← Back to Apps</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--surface-2), var(--border))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', border: '1px solid var(--border)'
          }}>
            {app.platform === 'ios' ? '🍎' : '🤖'}
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>{app.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                background: app.platform === 'ios' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
                color: app.platform === 'ios' ? '#818cf8' : '#4ade80'
              }}>{app.platform}</span>
              {app.bundle_id && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {app.bundle_id}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setShowUpload(true)} style={{
          padding: '12px 20px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          borderRadius: '12px', color: 'white', border: 'none', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600', fontFamily: 'Syne, sans-serif'
        }}>+ Upload Build</button>
      </div>

      {showUpload && (
        <UploadBuildModal
          app={app}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); loadData() }}
        />
      )}

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
        Builds <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '14px' }}>({builds.length})</span>
      </h2>

      {builds.length === 0 ? (
        <div className="glass" style={{ borderRadius: '20px', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No builds yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Upload your first build to start sharing with your team
          </p>
          <button onClick={() => setShowUpload(true)} style={{
            padding: '11px 24px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: '10px', color: 'white', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600'
          }}>Upload first build</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {builds.map((build, i) => (
            <Link key={build.id} href={`/dashboard/builds/${build.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass" style={{
                borderRadius: '16px', padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'all 0.2s',
                animation: `fadeUp 0.4s ease ${i * 0.05}s both`
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateX(0)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0
                  }}>📦</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '600' }}>v{build.version_name}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Build #{build.build_number}</span>
                    </div>
                    {build.release_notes && (
                      <p style={{
                        fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px',
                        maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{build.release_notes}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: tagColors[build.tag]?.bg || tagColors.qa.bg,
                    color: tagColors[build.tag]?.text || tagColors.qa.text
                  }}>{build.tag}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>
                    {new Date(build.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadBuildModal({ app, onClose, onSuccess }: any) {
  const [versionName, setVersionName] = useState('')
  const [buildNumber, setBuildNumber] = useState('')
  const [releaseNotes, setReleaseNotes] = useState('')
  const [tag, setTag] = useState('qa')
  const [file, setFile] = useState<File | null>(null)
  const [testflightLink, setTestflightLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFileSelect(f: File) {
    setFile(f)
    setError('')
    if (app.platform === 'android') {
      setParsing(true)
      try {
        const meta = await parseApkMetadata(f)
        if (meta.versionName) setVersionName(meta.versionName)
        if (meta.versionCode) setBuildNumber(meta.versionCode)
      } catch {
        // silently fail, user can fill manually
      }
      setParsing(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      let fileUrl = null

      if (app.platform === 'android' && file) {
        setProgress(10)
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${app.id}/${Date.now()}.${ext}`

        // Upload in chunks using standard upload
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('builds')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/vnd.android.package-archive'
          })

        if (uploadError) throw new Error(uploadError.message)
        setProgress(80)

        const { data: urlData } = supabase.storage.from('builds').getPublicUrl(path)
        fileUrl = urlData.publicUrl
      }

      setProgress(90)

      const { error: buildError } = await supabase.from('builds').insert({
        app_id: app.id,
        version_name: versionName,
        build_number: buildNumber,
        release_notes: releaseNotes || null,
        tag,
        file_url: fileUrl,
        file_size: file?.size || null,
        testflight_link: app.platform === 'ios' ? testflightLink : null,
        uploaded_by: user.id,
      })

      if (buildError) throw new Error(buildError.message)

      setProgress(100)
      setTimeout(() => onSuccess(), 500)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
       placeItems: 'center', 
      zIndex: 100, backdropFilter: 'blur(8px)',
      padding: '20px'
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        width: '100%', maxWidth: '520px',
        height: 'auto',
        maxHeight: '95vh',
        overflowY: 'auto',
        animation: 'fadeUp 0.3s ease forwards',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sticky header */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
          borderRadius: '24px 24px 0 0'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Upload Build</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>{app.name}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Form body */}
        <div style={{ padding: '24px 32px 32px', flex: 1 }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* File drop - Android */}
            {app.platform === 'android' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  APK / AAB File
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: '14px', padding: '28px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: dragOver ? 'rgba(99,102,241,0.05)' : file ? 'rgba(34,197,94,0.05)' : 'var(--surface-2)'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{parsing ? '⏳' : file ? '✅' : '📂'}</div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: file ? 'var(--success)' : 'var(--text)' }}>
                    {parsing ? 'Reading APK info...' : file ? file.name : 'Drop your APK or AAB here'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'or click to browse'}
                  </p>
                  <input
                    ref={fileRef} type="file" accept=".apk,.aab"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* TestFlight - iOS */}
            {app.platform === 'ios' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  TestFlight Link
                </label>
                <input
                  value={testflightLink}
                  onChange={e => setTestflightLink(e.target.value)}
                  placeholder="https://testflight.apple.com/join/..."
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px 16px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '10px', color: 'var(--text)', fontSize: '14px', outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            {/* Version + Build */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Version Name
                </label>
                <input
                  value={versionName}
                  onChange={e => setVersionName(e.target.value)}
                  placeholder={parsing ? 'Reading...' : '1.0.0'}
                  required
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px 16px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '10px', color: 'var(--text)', fontSize: '14px', outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Build Number
                </label>
                <input
                  value={buildNumber}
                  onChange={e => setBuildNumber(e.target.value)}
                  placeholder={parsing ? 'Reading...' : '42'}
                  required
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px 16px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '10px', color: 'var(--text)', fontSize: '14px', outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Tag */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Tag
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['qa', 'staging', 'production', 'hotfix'].map(t => (
                  <button key={t} type="button" onClick={() => setTag(t)} style={{
                    padding: '7px 14px', borderRadius: '20px', border: '1px solid',
                    borderColor: tag === t ? tagColors[t].text : 'var(--border)',
                    background: tag === t ? tagColors[t].bg : 'transparent',
                    color: tag === t ? tagColors[t].text : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.15s'
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Release notes */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Release Notes <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--border)' }}>(optional)</span>
              </label>
              <textarea
                value={releaseNotes}
                onChange={e => setReleaseNotes(e.target.value)}
                placeholder="What changed in this build..."
                rows={3}
                style={{
                  width: '100%', marginTop: '8px', padding: '12px 16px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none', resize: 'vertical', fontFamily: 'DM Sans, sans-serif'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Progress */}
            {loading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Uploading...</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{progress}%</span>
                </div>
                <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--surface-2)', height: '6px' }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    transition: 'width 0.4s ease', borderRadius: '10px'
                  }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--danger)'
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || parsing || (app.platform === 'android' && !file)}
              style={{
                padding: '14px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px',
                fontWeight: '600', cursor: (loading || parsing || (app.platform === 'android' && !file)) ? 'not-allowed' : 'pointer',
                opacity: (loading || parsing || (app.platform === 'android' && !file)) ? 0.6 : 1,
                fontFamily: 'Syne, sans-serif', marginTop: '4px'
              }}
            >
              {loading ? `Uploading ${progress}%...` : parsing ? 'Reading APK...' : 'Upload Build 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}