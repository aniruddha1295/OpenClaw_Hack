import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ClaimsList } from './pages/ClaimsList'
import { CallHistory } from './pages/CallHistory'
import { LiveCallView } from './pages/LiveCallView'
import { Analytics } from './pages/Analytics'
import { AgentConfig } from './pages/AgentConfig'
import { ClaimDetail } from './pages/ClaimDetail'
import { Blockchain } from './pages/Blockchain'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ClaimsList />} />
          <Route path="/calls" element={<CallHistory />} />
          <Route path="/live" element={<LiveCallView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/config" element={<AgentConfig />} />
          <Route path="/claims/:id" element={<ClaimDetail />} />
          <Route path="/blockchain" element={<Blockchain />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
