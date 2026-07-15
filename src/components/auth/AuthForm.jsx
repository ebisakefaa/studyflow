import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signUp, signIn, signInWithGoogle } = useAuth()
  const { addToast } = useToast()

  function validate() {
    const errs = {}
    if (!isLogin && !fullName.trim()) errs.name = 'Please enter your name'
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email'
    if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        addToast('Welcome back!', 'success')
      } else {
        const { error } = await signUp(email, password, fullName.trim())
        if (error) throw error
        addToast('Account created successfully!', 'success')
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

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
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <i className="fa-solid fa-book-open text-bg text-sm"></i>
            </div>
            <span className="font-display text-2xl font-bold">StudyFlow</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-muted mb-6">{isLogin ? 'Sign in to access your workspace' : 'Get started with StudyFlow for free'}</p>

          <button onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-s2 border border-bdr rounded-lg text-sm font-medium text-txt hover:bg-s3 transition-colors mb-5 disabled:opacity-50">
            {googleLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-google"></i>}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-bdr"></div>
            <span className="text-xs text-muted">or continue with email</span>
            <div className="flex-1 h-px bg-bdr"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {!isLogin && (
              <div>
                <label className="block text-sm text-muted mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name"
                  className="w-full px-4 py-3 bg-s2 border border-bdr rounded-lg text-txt placeholder-muted/50 font-body" />
                {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm text-muted mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com or you@university.edu"
                className="w-full px-4 py-3 bg-s2 border border-bdr rounded-lg text-txt placeholder-muted/50 font-body" />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
                className="w-full px-4 py-3 bg-s2 border border-bdr rounded-lg text-txt placeholder-muted/50 font-body" />
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          <p className="text-center text-muted text-sm mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => { setIsLogin(!isLogin); setErrors({}) }} className="text-accent hover:text-accent-l font-medium ml-1 transition-colors">
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}