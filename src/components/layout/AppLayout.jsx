import { useState } from 'react'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function AppLayout({ children, courses, activeCourseId, onCourseClick, onNewCourse, onProfileClick, onPlannerClick, onSearchClick, user, onLogout, onMenuClick }) {
  const [minimized, setMinimized] = useState(false)

  function toggleSidebar() { setMinimized(prev => !prev) }

  return (
    <div className="min-h-screen flex">
      <Sidebar courses={courses} activeCourseId={activeCourseId} onCourseClick={onCourseClick} onNewCourse={onNewCourse} onProfileClick={onProfileClick} onPlannerClick={onPlannerClick} onSearchClick={onSearchClick} user={user} onLogout={onLogout} minimized={minimized} onToggle={toggleSidebar} />
      <main className="flex-1 min-h-screen overflow-y-auto transition-all duration-300" style={{ marginLeft: minimized ? '4rem' : '16rem' }}>
        <MobileHeader onMenuClick={onMenuClick} />
        <div className="p-6 sm:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}