export interface StravaTokenResponse {
  token_type: string
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  athlete?: {
    id: number
    firstname: string
    lastname: string
    profile: string
  }
}

export function getStravaAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || ''
  const scope = 'read,activity:read_all'
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope,
    ...(state && { state })
  })

  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || ''
  const clientSecret = process.env.STRAVA_CLIENT_SECRET || ''

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Strava token exchange failed: ${errorText}`)
  }

  return response.json()
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || ''
  const clientSecret = process.env.STRAVA_CLIENT_SECRET || ''

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Strava token refresh failed: ${errorText}`)
  }

  return response.json()
}
