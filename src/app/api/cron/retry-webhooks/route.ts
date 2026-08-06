import { NextRequest, NextResponse } from 'next/server'
import { CronAuthorizationError } from '@/lib/errors'
import { validateCronRequest } from '@/lib/auth/cron'
import { getFailedWebhookEvents, markWebhookEventSuccess, incrementWebhookEventRetry, markWebhookEventFailed } from '@/lib/strava/webhook-retry'
import { processWebhookEvent } from '@/app/api/webhook/strava/route'

/**
 * Cron job endpoint to retry failed webhook events
 * Called by pg_cron every 5 minutes
 */
export async function POST(request: NextRequest) {
  try {
    // Validate cron request
    await validateCronRequest(request)

    // Get pending failed events
    const failedEvents = await getFailedWebhookEvents(10)

    if (failedEvents.length === 0) {
      return NextResponse.json({ success: true, message: 'No events to retry' })
    }

    console.log(`Retrying ${failedEvents.length} failed webhook events`)

    let successCount = 0
    let failCount = 0

    for (const event of failedEvents) {
      try {
        // Process the event
        await processWebhookEvent(
          event.activity_id,
          event.athlete_id,
          event.aspect_type,
          event.updates
        )

        // Mark as success
        await markWebhookEventSuccess(event.id)
        successCount++
        console.log(`Successfully retried webhook event ${event.id}`)
      } catch (error: any) {
        // Increment retry count
        await incrementWebhookEventRetry(event.id, error.message)
        failCount++
        console.error(`Failed to retry webhook event ${event.id}:`, error.message)

        // If max retries reached, mark as permanently failed
        if (event.retry_count >= 4) { // Already incremented, so 4 means this was 5th try
          await markWebhookEventFailed(event.id, `Max retries exceeded: ${error.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      retried: failedEvents.length,
      successCount,
      failedCount: failCount
    })
  } catch (error: any) {
    if (error instanceof CronAuthorizationError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Webhook retry cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
