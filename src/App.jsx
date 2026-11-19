import { Routes, Route } from 'react-router-dom'
import LanguageGate from './pages/LanguageGate'
import CountryStep from './pages/CountryStep'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LanguageGate />} />
      <Route path="/country" element={<CountryStep />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App