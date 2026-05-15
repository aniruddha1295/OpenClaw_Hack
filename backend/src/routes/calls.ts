import { FastifyInstance, FastifyRequest } from 'fastify';
import { CallsFilter, PaginatedResponse, ApiResponse, CallLog, CallToolExecution } from '../types/index.js';

interface CallLogWithCustomer extends CallLog {
  customer_name: string;
}

interface CallLogDetail extends CallLog {
  customer_name: string;
  tool_executions: CallToolExecution[];
}

export default async function callsRoutes(fastify: FastifyInstance) {
  // GET /calls — list call logs with optional filters and pagination
  fastify.get('/calls', {
    schema: { tags: ['Calls'], summary: 'List call logs with filters and pagination' }
  }, async (request: FastifyRequest<{
    Querystring: CallsFilter & { page?: string; limit?: string };
  }>) => {
    const { status, direction, customer_id } = request.query;
    const page = Math.max(1, parseInt(request.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '20', 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = fastify.supabase
      .from('call_logs')
      .select('*, customers(full_name)', { count: 'exact' })
      .order('started_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (direction) query = query.eq('direction', direction);
    if (customer_id) query = query.eq('customer_id', customer_id);

    const { data, error, count } = await query;

    if (error) {
      return { data: [], total: 0, page, limit, error: error.message } as any;
    }

    const calls: CallLogWithCustomer[] = (data || []).map((row: any) => {
      const { customers, ...call } = row;
      return { ...call, customer_name: customers?.full_name ?? '' };
    });

    const response: PaginatedResponse<CallLogWithCustomer> = {
      data: calls,
      total: count ?? 0,
      page,
      limit,
    };

    return response;
  });

  // GET /calls/:id — single call log with tool executions
  fastify.get('/calls/:id', {
    schema: { tags: ['Calls'], summary: 'Get single call log detail with tool executions' }
  }, async (request: FastifyRequest<{
    Params: { id: string };
  }>, reply) => {
    const { id } = request.params;

    // Fetch call log with customer name
    const { data: callRow, error: callError } = await fastify.supabase
      .from('call_logs')
      .select('*, customers(full_name)')
      .eq('id', id)
      .single();

    if (callError || !callRow) {
      reply.code(404);
      const response: ApiResponse<null> = { data: null, error: 'Call log not found' };
      return response;
    }

    // Fetch tool executions for this call
    const { data: toolExecs } = await fastify.supabase
      .from('call_tool_executions')
      .select('*')
      .eq('call_log_id', id)
      .order('executed_at', { ascending: true });

    const { customers, ...call } = callRow as any;

    const detail: CallLogDetail = {
      ...call,
      customer_name: customers?.full_name ?? '',
      tool_executions: toolExecs ?? [],
    };

    const response: ApiResponse<CallLogDetail> = { data: detail, error: null };
    return response;
  });
  fastify.post('/calls/:id/tool-executions', {
    schema: { tags: ['Calls'], summary: 'Log a tool execution for a live call' }
  }, async (request: FastifyRequest<{
  // POST /calls/:id/tool-executions — log a tool execution during a live call
  fastify.post('/calls/:id/tool-executions', async (request: FastifyRequest<{
    Params: { id: string };
    Body: {
      tool_name: string;
      tool_args?: Record<string, any>;
      tool_result?: Record<string, any>;
      success?: boolean;
      latency_ms?: number;
    };
  }>, reply) => {
    const { id } = request.params;
    const body = request.body as any;

    // Verify the call log exists
    const { data: callLog, error: callError } = await fastify.supabase
      .from('call_logs')
      .select('id')
      .eq('id', id)
      .single();

    if (callError || !callLog) {
      reply.code(404);
      return { data: null, error: 'Call log not found' };
    }

    // Log the tool execution
    const { data: execution, error } = await fastify.supabase
      .from('call_tool_executions')
      .insert({
        call_log_id: id,
        tool_name: body.tool_name,
        tool_args: body.tool_args || {},
        tool_result: body.tool_result || {},
        success: body.success !== false,
        latency_ms: body.latency_ms || null,
      })
      .select()
      .single();

    if (error) {
      fastify.log.error(error, 'Failed to log tool execution');
      reply.code(500);
      return { data: null, error: 'Failed to log tool execution' };
    }

    // Update the call_logs tools_used array
    const { data: currentCall } = await fastify.supabase
      .from('call_logs')
      .select('tools_used')
      .eq('id', id)
      .single();

    const currentTools = (currentCall?.tools_used as string[]) || [];
    if (!currentTools.includes(body.tool_name)) {
      await fastify.supabase
        .from('call_logs')
        .update({ tools_used: [...currentTools, body.tool_name] })
        .eq('id', id);
    }

    // Broadcast real-time event for live dashboard updates
    await fastify.supabase.channel('call-updates').send({
      type: 'broadcast',
      event: 'tool-executed',
      payload: {
        call_log_id: id,
        tool_execution: execution,
      },
    });

    return { data: execution, error: null };
  });
}
