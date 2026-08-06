import { createAdminClient } from '@/lib/supabase/admin'

interface FailedWebhookEvent {
  id: string
  activity_id: number
  athlete_id: number
  aspect_type: string
  updates?: any
  retry_count: number
  last_error: string
  created_at: string
}

/**
 * Store failed webhook event for retry processing
 */
export async function storeFailedWebhookEvent(
  activityId: number,
  athleteId: number,
  aspectType: string,
  updates?: any,
  errorMessage?: string
) {
  const supabase = createAdminClient()

  const { error: dbError } = await supabase
    .from('failed_webhook_events')
    .insert({
      activity_id: activityId,
      athlete_id: athleteId,
      aspect_type: aspectType,
      updates: updates || {},
      retry_count: 0,
      last_error: errorMessage || 'Unknown error',
      status: 'pending'
    })

  if (dbError) {
    console.error('Failed to store webhook event for retry:', dbError)
  }
}

/**
 * Get failed webhook events that need retry
 */
export async function getFailedWebhookEvents(limit = 10): Promise<FailedWebhookEvent[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('failed_webhook_events')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', 5) // Max 5 retries
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Failed to get webhook events:', error)
    return []
  }

  return (data as FailedWebhookEvent[]) || []
}

/**
 * Update failed webhook event status
 */
export async function updateFailedWebhookEvent(
  eventId: string,
  status: 'pending' | 'success' | 'failed',
  error?: string
) {
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('failed_webhook_events')
    .select('retry_count')
    .eq('id', eventId)
    .single()

  if (!event) return

  const { error: updateError } = await supabase
    .from('failed_webhook_events')
    .update({
      status,
      retry_count: status === 'pending' ? event.retry_count + 1 : event.retry_count,
      last_error: error || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)

  if (updateError) {
    console.error('Failed to update webhook event:', updateError)
  }
}

/**
 * Mark webhook event as successfully processed
 */
export async function markWebhookEventSuccess(eventId: string) {
  return updateFailedWebhookEvent(eventId, 'success')
}

/**
 * Increment retry count and keep as pending
 */
export async function incrementWebhookEventRetry(eventId: string, errorMessage: string) {
  return updateFailedWebhookEvent(eventId, 'pending', errorMessage)
}

/**
 * Mark webhook event as permanently failed
 */
export async function markWebhookEventFailed(eventId: string, errorMessage: string) {
  return updateFailedWebhookEvent(eventId, 'failed', errorMessage)
}
