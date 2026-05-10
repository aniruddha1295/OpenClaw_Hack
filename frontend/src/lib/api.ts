import axios from 'axios'
import type {
  Claim,
  ClaimDetail,
  CallLog,
  CallLogDetail,
  AnalyticsData,
  Escalation,
  AgentIdentity,
  PaginatedResponse,
  ApiResponse,
  ClaimsFilter,
  CallsFilter,
  EscalationsFilter,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005',
})

export async function getClaims(
  filter?: ClaimsFilter,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Claim>> {
  const params = { ...filter, page, limit }
  const { data } = await api.get<PaginatedResponse<Claim>>('/api/claims', { params })
  return data
}

export async function getClaim(id: string): Promise<ApiResponse<ClaimDetail>> {
  const { data } = await api.get<ApiResponse<ClaimDetail>>(`/api/claims/${id}`)
  return data
}

export async function verifyClaimIntegrity(id: string): Promise<ApiResponse<{
  match: boolean
  computed_hash?: string
  stored_hash?: string
  claim_hash?: string | null
  reason?: string
}>> {
  const { data } = await api.post(`/api/claims/${id}/verify-integrity`)
  return data
}

export async function getCalls(
  filter?: CallsFilter,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<CallLog>> {
  const params = { ...filter, page, limit }
  const { data } = await api.get<PaginatedResponse<CallLog>>('/api/calls', { params })
  return data
}

export async function getCall(id: string): Promise<ApiResponse<CallLogDetail>> {
  const { data } = await api.get<ApiResponse<CallLogDetail>>(`/api/calls/${id}`)
  return data
}

export async function getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
  const { data } = await api.get<ApiResponse<AnalyticsData>>('/api/analytics')
  return data
}

export async function getAgentIdentity(): Promise<ApiResponse<AgentIdentity>> {
  const { data } = await api.get<ApiResponse<AgentIdentity>>('/api/agent-identity')
  return data
}

export async function getEscalations(
  filter?: EscalationsFilter,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Escalation>> {
  const params = { ...filter, page, limit }
  const { data } = await api.get<PaginatedResponse<Escalation>>('/api/escalations', { params })
  return data
}
