import { useState } from 'react'

export default function MobileHeader({ onMenuClick }) {
  return (
    <div className="lg:hidden flex items-center gap-3 p-4 border-b border-bdr">
      <button
        onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-s2 transition-colors"
        aria-label="Open menu"
      >
        <i className="fa-solid fa-bars text-muted"></i>
      </button>
      <span className="font-display font-bold">StudyFlow</span>
    </div>
  )
}
