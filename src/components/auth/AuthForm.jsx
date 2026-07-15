import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export default function AuthForm() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signInWithGoogle } = useAuth()
  const { addToast } = useToast()

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      addToast(err.message, 'error')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-s1 flex-col justify-center items-center p-12">
        <div className="absolute w-64 h-64 bg-accent rounded-full top-10 -left-20 opacity-[0.07] animate-pulse"></div>
        <div className="absolute w-48 h-48 bg-sage rounded-full top-1/3 right-0 opacity-[0.07] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-32 h-32 bg-accent rounded-full bottom-20 left-1/4 opacity-[0.07] animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <i className="fa-solid fa-book-open text-bg text-xl"></i>
            </div>
            <span className="font-display text-4xl font-bold text-txt">StudyFlow</span>
          </div>
          <p className="text-xl text-muted leading-relaxed mb-8">Your personal learning workspace. Organize course materials, stay focused, and study smarter.</p>
          <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-muted"><i className="fa-solid fa-folder-open text-accent w-5"></i><span>Organize by course</span></div>
            <div className="flex items-center gap-3 text-muted"><i className="fa-solid fa-tags text-sage w-5"></i><span>Tag and filter documents</span></div>
            <div className="flex items-center gap-3 text-muted"><i className="fa-solid fa-file-pdf text-danger w-5"></i><span>Upload and view PDFs</span></div>
            <div className="flex items-center gap-3 text-muted"><i className="fa-solid fa-shield-halved text-accent w-5"></i><span>Secure cloud storage</span></div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md text-center">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <i className="fa-solid fa-book-open text-bg text-sm"></i>
            </div>
            <span className="font-display text-2xl font-bold">StudyFlow</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome to StudyFlow</h1>
          <p className="text-muted mb-8">Sign in with your Google account to get started.</p>
          <button onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-s2 border border-bdr rounded-xl text-sm font-medium text-txt hover:bg-s3 transition-colors disabled:opacity-50">
            {googleLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-google"></i>}
            Continue with Google
          </button>
          <p className="text-muted/40 text-xs mt-6">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  )
}