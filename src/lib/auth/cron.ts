import { CronAuthorizationError } from '@/lib/errors'
import { NextRequest } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET || 'default-cron-secret-change-me'

/**
 * Validate cron request authentication
 */
export async function validateCronRequest(request: NextRequest) {
  try {
    const body = await request.json()
    const { cron_key } = body

    if (cron_key !== CRON_SECRET) {
      throw new CronAuthorizationError('Invalid cron secret')
    }

    return true
  } catch (error) {
    if (error instanceof CronAuthorizationError) {
      throw error
    }
    throw new CronAuthorizationError('Invalid request format')
  }
}
