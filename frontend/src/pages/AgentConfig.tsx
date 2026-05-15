import { Volume2, Wrench, MessageSquare, Shield, Globe } from 'lucide-react'
import { AgentIdentityCard } from '../components/AgentIdentityCard'

const TOOLS = [
  { name: 'lookup_claim', description: 'Look up claim details by claim number or customer info', enabled: true },
  { name: 'check_claim_status', description: 'Check the current status of an existing claim', enabled: true },
  { name: 'file_claim', description: 'File a new insurance claim with incident details', enabled: true },
  { name: 'check_policy', description: 'Look up policy coverage, deductible, and status', enabled: true },
  { name: 'escalate_to_human', description: 'Transfer the call to a human agent with context', enabled: true },
  { name: 'schedule_callback', description: 'Schedule a follow-up callback for the customer', enabled: true },
  { name: 'attach_document', description: 'Attach photos or documents to an existing claim', enabled: true },
  { name: 'escalate_to_regulator', description: 'Submit a regulatory escalation with attestation', enabled: true },
]

const SYSTEM_PROMPT = `You are Alex, an AI phone agent for SafeGuard Insurance. You handle insurance claims, policy inquiries, and customer support calls professionally and empathetically.

## Your Capabilities:
- Look up existing claims and provide status updates
- File new insurance claims (auto, home, health, life)
- Check policy coverage details and deductibles
- Escalate complex issues to human agents
- Schedule follow-up callbacks

## Rules:
- Always verify the caller's identity before sharing account details
- Be empathetic and professional — callers may be stressed
- If unsure, escalate rather than guess
- Keep responses concise for phone conversation
- Confirm critical details (claim amounts, dates) by repeating them back`

export function AgentConfig() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Configuration</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">AI voice agent settings and tool permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Prompt — Left (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              System Prompt
            </h2>
            <pre className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
              {SYSTEM_PROMPT}
            </pre>
          </div>

          {/* Tools */}
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              Available Tools
            </h2>
            <div className="space-y-3">
              {TOOLS.map((tool) => (
                <div key={tool.name} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.name.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{tool.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    tool.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                  }`}>
                    {tool.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Settings — Right (1/3) */}
        <div className="space-y-6">
          <AgentIdentityCard />
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              Voice Settings
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">Voice Provider</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">ElevenLabs</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">Voice</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">Rachel (Professional)</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">Model</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">Conversational AI v2</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">First Message</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300 mt-1 italic">
                  "Thank you for calling SafeGuard Insurance. My name is Alex, your AI assistant. How can I help you today?"
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              Integration
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">Phone Provider</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">Twilio</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">WebRTC</dt>
                <dd className="text-sm font-medium text-green-600">Enabled</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-zinc-400">Webhook URL</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300 font-mono text-xs break-all mt-1">
                  {import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/webhooks/elevenlabs/conversation-ended
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              Safety
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Identity verification required
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Auto-escalation on uncertainty
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Call recording with consent
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                PII masking in logs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
