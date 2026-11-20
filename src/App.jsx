import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LanguageGate from './pages/LanguageGate'
import Welcome from './pages/Welcome'
import CountryStep from './pages/CountryStep'
import Home from './pages/Home'
import Search from './pages/Search'
import RecordResult from './pages/RecordResult'
import Check from './pages/Check'
import Calculator from './pages/Calculator'
import Track from './pages/Track'
import Settings from './pages/Settings'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LanguageGate />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/country" element={<CountryStep />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/record/:id" element={<RecordResult />} />
        <Route path="/check" element={<Check />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/track" element={<Track />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Placeholder titleKey="header.help" />} />
      </Route>
    </Routes>
  )
}

export default App