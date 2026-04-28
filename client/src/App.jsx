import { Routes, Route, Outlet } from 'react-router-dom'
import { NavTabs } from '@/components/NavTabs'
import { AllContactsPage } from '@/pages/AllContactsPage'

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

function FavoritesPlaceholder() {
  return (
    <div className="text-muted-foreground">
      Favorites page — coming in T044.
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AllContactsPage />} />
        <Route path="/favorites" element={<FavoritesPlaceholder />} />
      </Route>
    </Routes>
  )
}

export default App
