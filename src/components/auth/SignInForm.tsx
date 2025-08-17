import React, { useState } from 'react'
import { useSignInEmailPassword, useResetPassword, useAuthenticationStatus } from '@nhost/react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

interface SignInFormProps {
  onToggleMode: () => void
}

export default function SignInForm({ onToggleMode }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false)

  const { signInEmailPassword, isLoading, error } = useSignInEmailPassword()
  const { resetPassword, isLoading: isResetting, isSuccess: resetSuccess, error: resetError } = useResetPassword()
  const { isAuthenticated } = useAuthenticationStatus()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSignIn(true)
    try {
      await signInEmailPassword(email, password)
    } catch (err) {
      console.error('Sign in error:', err)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resetPassword(resetEmail)
    } catch (err) {
      console.error('Reset password error:', err)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          {resetSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-600">
                Password reset email sent! Check your inbox for further instructions.
              </p>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <label htmlFor="reset-email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email address"
                  />
                </div>
              </div>
              {resetError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">Unable to reset password. Please try again.</p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? 'Sending...' : 'Send reset link'}
                </button>
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 text-sm text-blue-600 hover:text-blue-500"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Log in to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {error && hasAttemptedSignIn && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">Unable to sign in. Please check your credentials and try again.</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot password?
            </button>
          </div>
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={onToggleMode}
              className="w-full flex justify-center py-2 px-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}