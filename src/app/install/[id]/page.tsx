export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
const tagColors: any = {
  qa: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  staging: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  production: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  hotfix: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

export default async function InstallPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const supabase = await createClient()

  const { data: build } = await supabase
    .from('builds')
    .select('*, apps(*)')
    .eq('id', id)
    .single()

  if (!build) notFound()

  const app = build.apps as any
  const isAndroid = app.platform === 'android'

  await supabase
    .from('builds')
    .update({ download_count: (build.download_count || 0) + 1 })
    .eq('id', id)

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{app.name} - v{build.version_name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'DM Sans', sans-serif;
            background: #0a0a0f;
            color: #e8e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          h1, h2, h3 { font-family: 'Syne', sans-serif; }
          .card {
            background: rgba(255,255,255,0.03);
            border: 1px solid #2a2a3a;
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 440px;
            text-align: center;
          }
          .icon {
            width: 80px; height: 80px;
            border-radius: 22px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            display: flex; align-items: center; justify-content: center;
            font-size: 36px;
            margin: 0 auto 24px;
          }
          .btn {
            display: block; width: 100%;
            padding: 16px 24px;
            border-radius: 14px;
            font-size: 16px; font-weight: 700;
            font-family: 'Syne', sans-serif;
            text-decoration: none;
            cursor: pointer;
            border: none;
            margin-top: 12px;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.9; }
          .btn-primary {
            background: linear-gradient(135deg, #6366f1, #a855f7);
            color: white;
          }
          .btn-green {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
          }
          .tag {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 11px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.8px;
            background: rgba(99,102,241,0.15);
            margin-bottom: 8px;
          }
          .meta {
            display: flex; justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #2a2a3a;
            font-size: 14px;
          }
          .meta:last-child { border-bottom: none; }
          .meta-label { color: #6b6b80; }
          .notes {
            background: #111118;
            border: 1px solid #2a2a3a;
            border-radius: 12px;
            padding: 16px;
            text-align: left;
            font-size: 13px;
            line-height: 1.7;
            color: #a0a0b0;
            margin-top: 20px;
            white-space: pre-wrap;
          }
          .orb {
            position: fixed; border-radius: 50%;
            filter: blur(80px); pointer-events: none; z-index: -1;
          }
        `}</style>
      </head>
      <body>
        <div className="orb" style={{ top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
        <div className="orb" style={{ bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />

        <div className="card">
          <div className="icon">{isAndroid ? '🤖' : '🍎'}</div>

          <span className="tag" style={{ color: tagColors[build.tag] || tagColors.qa }}>
            {build.tag}
          </span>

          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>{app.name}</h1>
          <p style={{ color: '#6b6b80', fontSize: '14px', marginBottom: '28px' }}>
            Version {build.version_name} · Build #{build.build_number}
          </p>

          {/* Action button */}
          {isAndroid ? (
            <a href={build.file_url} download className="btn btn-green">
              ⬇️ Download APK
            </a>
          ) : (
            <a href={build.testflight_link} target="_blank" className="btn btn-primary">
              Open in TestFlight →
            </a>
          )}

          {/* Build info */}
          <div style={{ marginTop: '28px', textAlign: 'left' }}>
            <div className="meta">
              <span className="meta-label">Platform</span>
              <span>{isAndroid ? 'Android' : 'iOS'}</span>
            </div>
            <div className="meta">
              <span className="meta-label">Version</span>
              <span>{build.version_name}</span>
            </div>
            <div className="meta">
              <span className="meta-label">Build</span>
              <span>#{build.build_number}</span>
            </div>
            <div className="meta">
              <span className="meta-label">Uploaded</span>
              <span>{new Date(build.created_at).toLocaleDateString()}</span>
            </div>
            {build.file_size && (
              <div className="meta">
                <span className="meta-label">Size</span>
                <span>{(build.file_size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            )}
          </div>

          {/* Release notes */}
          {build.release_notes && (
            <div className="notes">
              <p style={{ fontWeight: '600', color: '#e8e8f0', marginBottom: '8px', fontSize: '13px' }}>
                📝 Release Notes
              </p>
              {build.release_notes}
            </div>
          )}

          <p style={{ fontSize: '11px', color: '#3a3a4a', marginTop: '28px' }}>
            Powered by BuildDrop
          </p>
        </div>
      </body>
    </html>
  )
}