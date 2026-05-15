import { useNavigate } from 'react-router-dom'
import safeguardLogo from '../assets/safeguard.png'
import {
  Shield,
  Phone,
  HardDrive,
  Layers,
  Server,
  Mic2,
  Globe,
  BarChart2,
  Zap,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen font-sans" style={{ background: '#060606', color: '#fff' }}>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          width: max-content;
          animation: marqueeScroll 30s linear infinite;
        }
        html { scroll-behavior: smooth; }
        .glow-bg {
          background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(20,80,50,0.18) 0%, transparent 70%);
        }
        .card-dark {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .red-prefix {
          color: #dc2626;
          font-weight: 700;
          margin-right: 8px;
        }
      `}</style>

      {/* Background glow layer */}
      <div className="fixed inset-0 pointer-events-none glow-bg" />

      {/* ── 1. Navbar ── */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', background: 'rgba(6,6,6,0.85)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: '64px' }}>
          <div className="flex items-center gap-2">
            <img src={safeguardLogo} alt="SafeGuard" className="w-5 h-5 object-contain" />
            <span className="text-lg font-bold text-white">SafeGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Stats', 'Features', 'Technology'].map(item => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm cursor-pointer bg-transparent border-0"
                style={{ color: '#a1a1aa' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a1a1aa')}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/claims')}
              className="text-sm bg-transparent border-0 cursor-pointer"
              style={{ color: '#a1a1aa' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#a1a1aa')}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/claims')}
              className="text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: '#dc2626', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
              onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. Hero ── */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
          AI Claims Processing, Done Right
        </div>

        <h1 className="font-black leading-none tracking-tight mb-6" style={{ fontSize: 'clamp(56px, 9vw, 120px)', color: '#fff' }}>
          SafeGuard
        </h1>
        <p className="text-base font-semibold uppercase tracking-widest mb-8" style={{ color: '#dc2626', letterSpacing: '0.2em' }}>
          THE AI THAT ACTUALLY RESOLVES CLAIMS.
        </p>
        <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: '#a1a1aa' }}>
          Processes your claim call, attests it on-chain, and files it to decentralized storage — in under 2 minutes. No paperwork. No delays.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/claims')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
            style={{ background: '#dc2626', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
            onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
          >
            Start a Claim <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#e4e4e7', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            See How It Works
          </button>
        </div>

        {/* Floating status cards */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
          <div className="card-dark rounded-xl px-6 py-4 text-left">
            <p className="text-xs mb-1" style={{ color: '#71717a' }}>Avg processing time</p>
            <p className="text-2xl font-black text-white">&lt; 2 min</p>
            <p className="text-xs mt-1" style={{ color: '#71717a' }}>from call to filed claim</p>
          </div>
          <div className="card-dark rounded-xl px-6 py-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              <p className="text-xs" style={{ color: '#71717a' }}>Live processing</p>
            </div>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#a1a1aa' }}>AI voice agent · Blockchain attestation · Filecoin storage</p>
          </div>
          <div className="card-dark rounded-xl px-6 py-4 text-left">
            <p className="text-xs mb-1" style={{ color: '#71717a' }}>Claim accuracy</p>
            <p className="text-2xl font-black text-white">98.7%</p>
            <p className="text-xs mt-1" style={{ color: '#71717a' }}>verified on-chain</p>
          </div>
        </div>
      </section>

      {/* ── 3. Logo Marquee ── */}
      <section className="py-8 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-center mb-6" style={{ color: '#52525b' }}>
          Powered by world-class infrastructure
        </p>
        <div className="relative overflow-hidden">
          <div className="marquee-track flex">
            {[
              { icon: Shield, name: 'OpenClaw' },
              { icon: Mic2, name: 'ElevenLabs' },
              { icon: HardDrive, name: 'Filecoin' },
              { icon: Layers, name: 'Base' },
              { icon: Server, name: 'Supabase' },
              { icon: Phone, name: 'Twilio' },
              { icon: Globe, name: 'Ethereum' },
              { icon: Shield, name: 'Base Sepolia' },
              { icon: Zap, name: 'EAS Protocol' },
              { icon: Shield, name: 'OpenClaw' },
              { icon: Mic2, name: 'ElevenLabs' },
              { icon: HardDrive, name: 'Filecoin' },
              { icon: Layers, name: 'Base' },
              { icon: Server, name: 'Supabase' },
              { icon: Phone, name: 'Twilio' },
              { icon: Globe, name: 'Ethereum' },
              { icon: Shield, name: 'Base Sepolia' },
              { icon: Zap, name: 'EAS Protocol' },
            ].map(({ icon: Icon, name }, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap mx-10" style={{ color: '#52525b' }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Stats ── */}
      <section id="stats" className="py-20 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: '98.7%', label: 'Claim accuracy' },
            { value: '< 2 min', label: 'Processing time' },
            { value: '10,000+', label: 'Claims processed' },
            { value: '100%', label: 'On-chain verifiable' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black text-white mb-2">{value}</div>
              <div className="text-sm" style={{ color: '#71717a' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. What It Does ── */}
      <section id="features" className="py-20 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            <span className="red-prefix">›</span>
            <span className="text-white">What It Does</span>
          </h2>
          <p className="text-sm mb-10 max-w-xl" style={{ color: '#71717a' }}>
            From the first ring to an immutable record — SafeGuard combines conversational AI with blockchain verification so every claim is processed without manual intervention.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Phone, label: 'AI Voice Agent', desc: 'ElevenLabs-powered conversational AI handles inbound claims calls 24/7, extracting structured data from natural conversation.' },
              { icon: Shield, label: 'Blockchain Attestation', desc: 'Every claim is cryptographically attested on Base Sepolia using EAS — tamper-proof and publicly verifiable on-chain.' },
              { icon: HardDrive, label: 'Decentralized Storage', desc: 'Claims are pinned to Filecoin via Storacha for permanent, censorship-resistant record keeping.' },
              { icon: BarChart2, label: 'Real-time Analytics', desc: 'Live dashboards track call metrics, claim outcomes, and processing KPIs as they happen.' },
              { icon: Zap, label: 'Instant Processing', desc: 'From the first ring to a filed claim in under 2 minutes — extracted, validated, and submitted automatically.' },
              { icon: ClipboardList, label: 'Full Audit Trail', desc: 'Every action is logged immutably, giving you a complete, verifiable chain of custody for every claim.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card-dark rounded-xl p-6 group" style={{ transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-5" style={{ background: 'rgba(220,38,38,0.12)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#dc2626' }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{label}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717a' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Works With Everything ── */}
      <section id="technology" className="py-20 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            <span className="red-prefix">›</span>
            <span className="text-white">Works With Everything</span>
          </h2>
          <p className="text-sm mb-10" style={{ color: '#71717a' }}>Enterprise-grade integrations across AI, blockchain, and storage.</p>

          <div className="flex flex-wrap gap-3 mb-6">
            {['ElevenLabs', 'Filecoin', 'Base', 'Supabase', 'Twilio', 'Ethereum', 'EAS Protocol', 'Storacha'].map(name => (
              <div key={name} className="card-dark px-4 py-2 rounded-lg text-sm font-medium" style={{ color: '#a1a1aa' }}>
                {name}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Mic2, name: 'ElevenLabs', badge: 'Voice AI', desc: 'State-of-the-art conversational AI with low-latency voice synthesis and real-time function calling for natural claims interviews.' },
              { icon: HardDrive, name: 'Filecoin + Storacha', badge: 'Storage', desc: 'Decentralized permanent storage ensuring claims data can never be altered, censored, or deleted.' },
              { icon: Layers, name: 'Base + EAS', badge: 'Blockchain', desc: 'Layer 2 blockchain attestations using the Ethereum Attestation Service for cryptographically verifiable claim records.' },
            ].map(({ icon: Icon, name, badge, desc }) => (
              <div key={name} className="card-dark rounded-xl p-6"
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(220,38,38,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.12)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#dc2626' }} />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#71717a' }}>{badge}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717a' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. How It Works (step cards) ── */}
      <section className="py-20 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            <span className="red-prefix">›</span>
            <span className="text-white">How It Works</span>
          </h2>
          <p className="text-sm mb-10" style={{ color: '#71717a' }}>Three steps. Fully automated. Completely on-chain.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Caller dials in', desc: 'Policyholder calls the SafeGuard hotline. The ElevenLabs AI agent answers instantly, 24/7, and conducts a structured interview to capture all claim details.' },
              { step: '02', title: 'AI processes the claim', desc: 'Speech-to-structured-data extraction runs in real time. The claim is validated, enriched, and prepared for submission — no human review required.' },
              { step: '03', title: 'On-chain attestation + storage', desc: 'The claim is cryptographically attested on Base Sepolia via EAS and permanently stored on Filecoin. Tamper-proof and publicly verifiable.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card-dark rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-5xl font-black" style={{ color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>{step}</div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-5" style={{ background: 'rgba(220,38,38,0.15)', color: '#dc2626' }}>{step}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717a' }}>{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: '#dc2626' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully automated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Get Started CTA ── */}
      <section id="cta" className="py-20 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-dark rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-2">
              <span className="red-prefix">›</span>
              <span className="text-white">Get Started</span>
            </h2>
            <p className="text-sm mb-8" style={{ color: '#71717a' }}>
              No setup fees. Deploy in minutes. Full audit trail from day one.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { v: '24/7', l: 'Always available' },
                { v: '< 2min', l: 'Time to claim' },
                { v: '0', l: 'Manual steps' },
                { v: '∞', l: 'Audit records' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="text-3xl font-black text-white mb-1">{v}</div>
                  <div className="text-xs" style={{ color: '#71717a' }}>{l}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/claims')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold mx-auto"
              style={{ background: '#dc2626', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
              onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
            >
              Start Your First Claim <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 10. Footer ── */}
      <footer className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={safeguardLogo} alt="SafeGuard" className="w-4 h-4 object-contain" />
            <span className="text-sm font-bold text-white">SafeGuard</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: '#52525b' }}>
            <span>Built with OpenClaw · Filecoin · Base · ElevenLabs</span>
          </div>
          <p className="text-xs" style={{ color: '#3f3f46' }}>© 2026 SafeGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
