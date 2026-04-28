import { Routes, Route, Outlet } from 'react-router-dom'
import { NavTabs } from '@/components/NavTabs'

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

function AllContactsPlaceholder() {
  return (
    <div className="text-muted-foreground">
      All Contacts page — coming in T028.
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
        <Route path="/" element={<AllContactsPlaceholder />} />
        <Route path="/favorites" element={<FavoritesPlaceholder />} />
      </Route>
    </Routes>
  )
}

export default App
