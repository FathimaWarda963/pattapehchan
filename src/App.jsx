import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LanguageGate from './pages/LanguageGate'
import CountryStep from './pages/CountryStep'
import Home from './pages/Home'
import Search from './pages/Search'
import RecordResult from './pages/RecordResult'
import Check from './pages/Check'
import Calculator from './pages/Calculator'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LanguageGate />} />
      <Route path="/country" element={<CountryStep />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/record/:id" element={<RecordResult />} />
        <Route path="/check" element={<Check />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/track" element={<Placeholder titleKey="home.track.title" />} />
        <Route path="/help" element={<Placeholder titleKey="header.help" />} />
        <Route path="/settings" element={<Placeholder titleKey="header.settings" />} />
      </Route>
    </Routes>
  )
}

export default App