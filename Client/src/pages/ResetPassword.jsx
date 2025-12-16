import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword as apiResetPassword } from '../utils/authApi'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)

  // Extract token from URL query parameter
  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      setTokenValid(true)
    } else {
      setError("No reset token provided. Please use the link from your email.")
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Client-side validation
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your password")
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const result = await apiResetPassword(token, newPassword)
      setSuccess("Password reset successfully! Redirecting to login...")
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again or request a new reset link.")
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="bg-linear-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">
            No reset token was provided. Please use the password reset link from your email.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-2 rounded-md cursor-pointer shadow-md shadow-emerald-400/40"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-linear-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">🔐 Reset Password</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                id="new_password"
                name="new_password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="border border-gray-200 rounded w-full p-3 mt-1 pr-10 outline-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password Field */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="border border-gray-200 rounded w-full p-3 mt-1 pr-10 outline-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
            <p className="text-sm text-blue-800">
              <strong>✓ Password Requirements:</strong>
              <br />
              • At least 8 characters long
              <br />
              • Make it strong and unique
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white w-full py-3 rounded-md cursor-pointer shadow-md shadow-emerald-400/40 font-medium mt-6"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          {/* Back to Login */}
          <p className="text-center mt-4 text-gray-600">
            Remembered your password?{" "}
            <span
              onClick={() => navigate('/login')}
              className="text-emerald-600 cursor-pointer hover:underline font-medium"
            >
              Back to login
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
