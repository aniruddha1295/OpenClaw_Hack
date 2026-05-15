import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ClaimsList } from './pages/ClaimsList'
import { CallHistory } from './pages/CallHistory'
import { LiveCallView } from './pages/LiveCallView'
import { Analytics } from './pages/Analytics'
import { AgentConfig } from './pages/AgentConfig'
import { ClaimDetail } from './pages/ClaimDetail'
import { Blockchain } from './pages/Blockchain'
import Landing from './pages/Landing'
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/claims" element={<ClaimsList />} />
            <Route path="/calls" element={<CallHistory />} />
            <Route path="/live" element={<LiveCallView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/blockchain" element={<Blockchain />} />
            <Route path="/config" element={<AgentConfig />} />
            <Route path="/claims/:id" element={<ClaimDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ThemeToggle />
    </ThemeProvider>
  )
}

export default App
