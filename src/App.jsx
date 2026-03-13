import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import BuildDetail from './pages/BuildDetail'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Impressum from './pages/Impressum'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/build/:id" element={<BuildDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <footer className="site-footer">
            <div className="container">
              <span>© {new Date().getFullYear()} REDSTONELAB — Hobbyprojekt</span>
              <NavLink to="/impressum" className="footer-link">Impressum</NavLink>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
