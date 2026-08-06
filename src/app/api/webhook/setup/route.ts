import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!clientId || !clientSecret || !verifyToken || !appUrl) {
    return NextResponse.json(
      { error: 'Missing required env vars. Set NEXT_PUBLIC_STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_WEBHOOK_VERIFY_TOKEN, NEXT_PUBLIC_APP_URL' },
      { status: 500 }
    )
  }

  const callbackUrl = `${appUrl}/api/webhook/strava`

  const params = new URLSearchParams({
    'client_id': clientId,
    'client_secret': clientSecret,
    'callback_url': callbackUrl,
    'verify_token': verifyToken,
  })

  const res = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      object_type: 'activity',
      aspect_type: 'create',
      callback_url: callbackUrl,
      verify_token: verifyToken,
    }),
  })

  const text = await res.text()

  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Strava subscription failed', status: res.status, detail: body },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, subscription: body, callback_url: callbackUrl })
}

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing Strava credentials' }, { status: 500 })
  }

  const params = new URLSearchParams({
    'client_id': clientId,
    'client_secret': clientSecret,
  })

  const res = await fetch(`https://www.strava.com/api/v3/push_subscriptions?${params}`)
  const data = await res.json()

  return NextResponse.json({ subscriptions: data })
}
