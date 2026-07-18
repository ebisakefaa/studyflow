import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import { ThemeProvider } from './hooks/useTheme'
import { supabase } from './lib/supabase'
import AuthForm from './components/auth/AuthForm'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import Profile from './pages/Profile'
import Planner from './pages/Planner'
import Search from './pages/Search'
import PaymentSuccess from './pages/PaymentSuccess'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted"><i className="fa-solid fa-spinner fa-spin mr-3 text-accent"></i>Loading...</div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted"><i className="fa-solid fa-spinner fa-spin mr-3 text-accent"></i>Loading...</div>
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [courses, setCourses] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeCourseId = location.pathname.startsWith('/course/') ? location.pathname.split('/course/')[1] : null
  const isProfile = location.pathname === '/profile'
  const isPlanner = location.pathname === '/planner'
  const isSearch = location.pathname === '/search'

  useEffect(() => {
    if (!user) return
    supabase.from('courses').select('id, name, color, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => { setCourses(data || []) })
  }, [user, location])

  function handleCourseClick(courseId) { if (courseId) navigate('/course/' + courseId); else navigate('/'); setSidebarOpen(false) }
  function handleProfileClick() { navigate('/profile'); setSidebarOpen(false) }
  function handlePlannerClick() { navigate('/planner'); setSidebarOpen(false) }
  function handleSearchClick() { navigate('/search'); setSidebarOpen(false) }
  async function handleLogout() { await signOut(); navigate('/auth') }
  function handleMenuClick() { const sb = document.getElementById('sidebar'); if (sb) { sb.classList.toggle('-translate-x-full'); sb.classList.toggle('translate-x-0') } }

  function getActiveId() {
    if (isProfile) return '__profile__'
    if (isPlanner) return '__planner__'
    if (isSearch) return '__search__'
    return activeCourseId
  }

  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthForm /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><AppLayout courses={courses} activeCourseId={getActiveId()} onCourseClick={handleCourseClick} onNewCourse={() => navigate('/')} onProfileClick={handleProfileClick} onPlannerClick={handlePlannerClick} onSearchClick={handleSearchClick} user={user} onLogout={handleLogout} onMenuClick={handleMenuClick}><Dashboard user={user} onNavigateCourse={(id) => navigate('/course/' + id)} /></AppLayout></ProtectedRoute>} />
      <Route path="/course/:courseId" element={<ProtectedRoute><AppLayout courses={courses} activeCourseId={getActiveId()} onCourseClick={handleCourseClick} onNewCourse={() => navigate('/')} onProfileClick={handleProfileClick} onPlannerClick={handlePlannerClick} onSearchClick={handleSearchClick} user={user} onLogout={handleLogout} onMenuClick={handleMenuClick}><CourseDetail courseId={activeCourseId} user={user} onBack={() => navigate('/')} /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout courses={courses} activeCourseId={getActiveId()} onCourseClick={handleCourseClick} onNewCourse={() => navigate('/')} onProfileClick={handleProfileClick} onPlannerClick={handlePlannerClick} onSearchClick={handleSearchClick} user={user} onLogout={handleLogout} onMenuClick={handleMenuClick}><Profile onBack={() => navigate('/')} /></AppLayout></ProtectedRoute>} />
      <Route path="/planner" element={<ProtectedRoute><AppLayout courses={courses} activeCourseId={getActiveId()} onCourseClick={handleCourseClick} onNewCourse={() => navigate('/')} onProfileClick={handleProfileClick} onPlannerClick={handlePlannerClick} onSearchClick={handleSearchClick} user={user} onLogout={handleLogout} onMenuClick={handleMenuClick}><Planner onBack={() => navigate('/')} /></AppLayout></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><AppLayout courses={courses} activeCourseId={getActiveId()} onCourseClick={handleCourseClick} onNewCourse={() => navigate('/')} onProfileClick={handleProfileClick} onPlannerClick={handlePlannerClick} onSearchClick={handleSearchClick} user={user} onLogout={handleLogout} onMenuClick={handleMenuClick}><Search onBack={() => navigate('/')} /></AppLayout></ProtectedRoute>} />
      <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider><ToastProvider>
          <AppRoutes />
        </ToastProvider></ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}