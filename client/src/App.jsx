import { Routes, Route, Outlet } from 'react-router-dom'
import { NavTabs } from '@/components/NavTabs'
import { AllContactsPage } from '@/pages/AllContactsPage'
import { FavoritesPage } from '@/pages/FavoritesPage'

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavTabs />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AllContactsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>
    </Routes>
  )
}

export default App
