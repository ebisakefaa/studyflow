import { useState } from 'react'

export default function Sidebar({ courses, activeCourseId, onCourseClick, onNewCourse, user, onLogout, minimized, onToggle }) {
  return (
    <aside className={'fixed top-0 left-0 z-40 h-screen bg-s1 border-r border-bdr flex flex-col shrink-0 transition-all duration-300 ' + (minimized ? 'w-16' : 'w-64')}>
      <div className={'flex items-center gap-2.5 p-4 ' + (minimized ? 'justify-center' : 'p-5')}>
        {!minimized && (
          <>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <i className="fa-solid fa-book-open text-bg text-sm"></i>
            </div>
            <span className="font-display text-lg font-bold">StudyFlow</span>
          </>
        )}
        {minimized && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <i className="fa-solid fa-book-open text-bg text-sm"></i>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 overflow-y-auto overflow-x-hidden">
        <button
          onClick={() => onCourseClick(null)}
          className={'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-colors hover:bg-s2 mb-1 ' + (minimized ? 'p-2.5 justify-center' : 'px-3 py-2.5') + (!activeCourseId ? ' bg-s2 text-txt' : ' text-muted hover:text-txt')}
          title={minimized ? 'Dashboard' : ''}
        >
          <i className="fa-solid fa-grip w-4 text-center shrink-0"></i>
          {!minimized && <span>Dashboard</span>}
        </button>

        {!minimized && (
          <div className="mt-5 mb-2 px-3 text-xs font-semibold text-muted/50 uppercase tracking-wider">Courses</div>
        )}
        {minimized && <div className="my-3 mx-3 border-t border-bdr"></div>}

        <div className="flex flex-col gap-0.5">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => onCourseClick(c.id)}
              className={'w-full flex items-center gap-3 rounded-lg text-sm transition-colors hover:bg-s2 ' + (minimized ? 'p-2.5 justify-center' : 'px-3 py-2') + (activeCourseId === c.id ? ' bg-s2 text-txt' : ' text-muted hover:text-txt')}
              title={minimized ? c.name : ''}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
              {!minimized && (
                <>
                  <span className="truncate">{c.name}</span>
                  <span className="ml-auto text-xs text-muted/50">{c.doc_count || 0}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onNewCourse}
          className={'w-full flex items-center gap-3 rounded-lg text-sm text-muted hover:text-accent transition-colors mt-1 ' + (minimized ? 'p-2.5 justify-center' : 'px-3 py-2')}
          title={minimized ? 'New Course' : ''}
        >
          <i className="fa-solid fa-plus w-4 text-center shrink-0"></i>
          {!minimized && <span>New Course</span>}
        </button>
      </nav>

      <div className="p-2 border-t border-bdr">
        <button
          onClick={onToggle}
          className={'w-full flex items-center gap-3 rounded-lg text-sm text-muted hover:text-txt transition-colors ' + (minimized ? 'p-2.5 justify-center' : 'px-3 py-2.5')}
          title={minimized ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          <i className={'fa-solid w-4 text-center shrink-0 ' + (minimized ? 'fa-angles-right' : 'fa-angles-left')}></i>
          {!minimized && <span>Minimize</span>}
        </button>
        <button
          onClick={onLogout}
          className={'w-full flex items-center gap-3 rounded-lg text-sm text-muted hover:text-danger transition-colors ' + (minimized ? 'p-2.5 justify-center' : 'px-3 py-2.5')}
          title={minimized ? 'Sign out' : ''}
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center shrink-0"></i>
          {!minimized && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}