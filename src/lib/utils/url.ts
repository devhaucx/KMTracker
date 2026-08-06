import type { NextRequest } from 'next/server'

export function getAppUrl(request?: NextRequest | Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '')
  }

  if (request) {
    const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
    if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('127.0.0.1')) {
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      return `${proto}://${rawHost}`.replace(/\/+$/, '')
    }
  }

  return 'https://kmtracker.dev-haucx.workers.dev'
}
