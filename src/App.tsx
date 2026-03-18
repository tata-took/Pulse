import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TabBar } from './components/layout/TabBar'
import { LibraryScreen } from './components/library/LibraryScreen'
import { SearchScreen } from './components/search/SearchScreen'
import { TimelineScreen } from './components/timeline/TimelineScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { ToastContainer } from './components/ui/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<><LibraryScreen /><TabBar /></>} />
        <Route path="/search" element={<><SearchScreen /><TabBar /></>} />
        <Route path="/timeline/:tabId" element={<><TimelineScreen /><TabBar /></>} />
        <Route path="/settings" element={<><SettingsScreen /><TabBar /></>} />
      </Routes>
    </BrowserRouter>
  )
}
