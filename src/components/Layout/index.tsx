import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-secondary-800 text-white py-8">
        <div className="container-page">
          <div className="text-center text-secondary-400 text-sm">
            © 2026 Marketplace Latvia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
