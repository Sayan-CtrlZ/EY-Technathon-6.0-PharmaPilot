import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { loginUser as apiLogin, registerUser as apiRegister, requestPasswordReset, getCurrentUser } from '../utils/authApi'

const Login = () => {

  const [state, setState] = useState("login") // login | register | forgot
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { loginUser } = useAppContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)
    
    try {
      if (state === "forgot") {
        if (!email) {
          setError("Please enter your email to reset password")
          setLoading(false)
          return
        }
        console.log("Sending password reset request for:", email)
        try {
          const result = await requestPasswordReset(email)
          console.log("Password reset response:", result)
          setInfo("✅ Password reset email sent! Check your inbox (and spam folder) for the reset link.")
          setEmail("")
        } catch (error) {
          console.error("Password reset error:", error)
          setError(error.message || "Failed to send reset email. Please try again.")
        }
        setLoading(false)
      } else if (state === "register") {
        // Register new user
        if (!password) {
          setError("Please enter a password")
          setLoading(false)
          return
        }
        
        if (password.length < 8) {
          setError("Password must be at least 8 characters long")
          setLoading(false)
          return
        }
        
        const userData = await apiRegister(email, fullName, password)
        
        // Auto-login after registration
        await apiLogin(email, password)
        loginUser(userData)
        setLoading(false)
        navigate('/loading')
      } else {
        // Login existing user
        await apiLogin(email, password)
        
        // Fetch actual user data from backend (session is in httpOnly cookies)
        const userData = await getCurrentUser()
        
        loginUser(userData)
        setLoading(false)
        navigate('/loading')
      }
    } catch (err) {
      // Catch-all for any errors (login, registration, forgot password)
      const errorMessage = err?.message || "Something went wrong. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      name={state === "login" ? "login-form" : state === "register" ? "signup-form" : "forgot-password-form"}
      method="post"
      className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
    >
      <p className="text-2xl font-medium m-auto">
        <span className="text-emerald-600">User</span> {state === "login" ? "Login" : state === "register" ? "Sign Up" : "Forgot Password"}
      </p>
      {info && (
        <div className="w-full p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {info}
        </div>
      )}
      {error && (
        <div className="w-full p-3 rounded bg-red-100 border border-red-300 text-red-700 text-sm">
          {error}
        </div>
      )}
      {state === "register" && (
        <div className="w-full">
          <p>Full Name</p>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            placeholder="John Doe"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-emerald-500"
            type="text"
            required
          />
        </div>
      )}
      <div className="w-full">
        <p>Email</p>
        <input
          id="email"
          name="email"
          autoComplete={state === "register" ? "email username" : "username email"}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="user@example.com"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-emerald-500"
          type="email"
          required
        />
      </div>
      {state !== "forgot" && (
        <div className="w-full ">
          <p>Password</p>
          <div className="relative">
            <input 
              id="password"
              name="password"
              autoComplete={state === "register" ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              placeholder="Enter your password" 
              className="border border-gray-200 rounded w-full p-2 mt-1 pr-10 outline-emerald-500" 
              type={showPassword ? "text" : "password"} 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {state === "register" && (
            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters required</p>
          )}
          {state === "login" && (
            <p className="text-xs text-emerald-600 mt-2 cursor-pointer" onClick={() => { setState("forgot"); setError(""); setInfo(""); }}>Forgot password?</p>
          )}
        </div>
      )}

      {state === "register" && (
        <p>
          Already have account? <span onClick={() => { setState("login"); setError(""); setInfo(""); }} className="text-emerald-600 cursor-pointer">click here</span>
        </p>
      )}
      {state === "login" && (
        <p>
          Create an account? <span onClick={() => { setState("register"); setError(""); setInfo(""); }} className="text-emerald-600 cursor-pointer">click here</span>
        </p>
      )}
      {state === "forgot" && (
        <p>
          Remembered your password? <span onClick={() => { setState("login"); setError(""); setInfo(""); }} className="text-emerald-600 cursor-pointer">Back to login</span>
        </p>
      )}

      <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white w-full py-2 rounded-md cursor-pointer shadow-md shadow-emerald-400/40">
        {loading ? "Loading..." : state === "register" ? "Create Account" : state === "forgot" ? "Send reset link" : "Login"}
      </button>
    </form>
  )
}

export default Login
