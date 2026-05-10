import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { config } from '../config/environment.js';
import { ElevenLabsConversationEndedPayload } from '../types/index.js';
import { createCallLog, updateCallLog, logToolExecution } from '../services/call-log-service.js';

export default async function webhooksRoutes(fastify: FastifyInstance) {

  fastify.post('/webhooks/elevenlabs/conversation-ended', async (request, reply) => {
    const rawBody = typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body ?? {});
    if (!verifyWebhookSignature(request, rawBody)) {
      return reply.status(401).send({ success: false, error: 'Invalid webhook signature' });
    }

    const payload = (typeof request.body === 'string'
      ? JSON.parse(request.body)
      : request.body) as ElevenLabsConversationEndedPayload;

    try {
      // Check if call_log already exists for this conversation
      const { data: existing } = await fastify.supabase
        .from('call_logs')
        .select('id')
        .eq('elevenlabs_conversation_id', payload.conversation_id)
        .single();

      // Build the call log data
      const transcript = payload.transcript || [];
      const toolsUsed = extractToolsUsed(transcript);
      const durationSeconds = calculateDuration(payload);

      const dataCollection = (payload.analysis as any)?.data_collection_results ?? null;
      const evaluation = (payload.analysis as any)?.evaluation_criteria_results ?? null;

      const callLogData = {
        elevenlabs_conversation_id: payload.conversation_id,
        direction: 'inbound' as const,
        status: 'completed' as const,
        duration_seconds: durationSeconds,
        transcript: transcript.map(t => ({
          role: t.role,
          message: t.message,
          ...(t.timestamp != null ? { timestamp: String(t.timestamp) } : {}),
        })),
        summary: payload.analysis?.transcript_summary || null,
        outcome: payload.analysis?.call_successful ? 'resolved' : 'unresolved',
        tools_used: toolsUsed,
        analysis: dataCollection,
        evaluation,
        metadata: payload.metadata ?? null,
        webhook_payload: payload as any,
        ended_at: new Date().toISOString(),
      };

      let callLog;
      if (existing) {
        callLog = await updateCallLog(fastify.supabase, existing.id, callLogData);
      } else {
        callLog = await createCallLog(fastify.supabase, {
          ...callLogData,
          started_at: new Date().toISOString(),
        });
      }

      // Log individual tool executions if available in metadata
      if (payload.metadata?.tool_calls) {
        for (const toolCall of payload.metadata.tool_calls) {
          await logToolExecution(fastify.supabase, {
            call_log_id: callLog.id,
            tool_name: toolCall.name,
            tool_args: toolCall.args || {},
            tool_result: toolCall.result || {},
            success: toolCall.success !== false,
            latency_ms: toolCall.latency_ms || null,
          });
        }
      }

      // Broadcast via Supabase realtime (channel-based)
      await fastify.supabase.channel('call-updates').send({
        type: 'broadcast',
        event: 'call-completed',
        payload: { call_log_id: callLog.id },
      });

      return reply.status(200).send({
        success: true,
        call_log_id: callLog.id
      });
    } catch (error) {
      fastify.log.error(error, 'Error processing conversation-ended webhook');
      return reply.status(500).send({
        success: false,
        error: 'Failed to process webhook'
      });
    }
  });
}

function extractToolsUsed(transcript: Array<{ role: string; message: string }>): string[] {
  // Tools are tracked server-side; this extracts from transcript if tool calls are embedded
  const tools = new Set<string>();
  // Tool names we know about
  const knownTools = ['lookup_claim', 'file_claim', 'check_policy', 'check_documents', 'escalate_to_human', 'schedule_callback'];

  for (const entry of transcript) {
    for (const tool of knownTools) {
      if (entry.message && entry.message.toLowerCase().includes(tool.replace('_', ' '))) {
        tools.add(tool);
      }
    }
  }
  return Array.from(tools);
}

function calculateDuration(payload: ElevenLabsConversationEndedPayload): number {
  if (payload.metadata?.duration_seconds) {
    return payload.metadata.duration_seconds;
  }
  // Estimate from transcript timestamps
  const transcript = payload.transcript || [];
  if (transcript.length >= 2) {
    const first = transcript[0].timestamp || 0;
    const last = transcript[transcript.length - 1].timestamp || 0;
    if (last > first) return Math.round(last - first);
  }
  return 0;
}

function verifyWebhookSignature(request: any, rawBody: string): boolean {
  if (!config.elevenlabsWebhookSecret) {
    return true;
  }

  const headerValue = request.headers['x-elevenlabs-signature']
    || request.headers['x-signature']
    || request.headers['x-webhook-signature'];

  if (typeof headerValue !== 'string') {
    return false;
  }

  const provided = headerValue.includes('=') ? headerValue.split('=')[1] : headerValue;
  const expected = crypto
    .createHmac('sha256', config.elevenlabsWebhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}
