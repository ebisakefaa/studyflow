import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium backdrop-blur-sm animate-[toastIn_0.35s_ease-out]"
            style={{
              borderColor: t.type === 'success' ? 'var(--color-success)' : t.type === 'error' ? 'var(--color-danger)' : 'var(--color-accent)',
              backgroundColor: t.type === 'success' ? 'rgba(106,170,123,0.1)' : t.type === 'error' ? 'rgba(196,80,58,0.1)' : 'rgba(212,160,57,0.1)',
              color: t.type === 'success' ? 'var(--color-success)' : t.type === 'error' ? 'var(--color-danger)' : 'var(--color-accent)',
            }}
          >
            <i className={'fa-solid ' + (t.type === 'success' ? 'fa-circle-check' : t.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info')}></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
