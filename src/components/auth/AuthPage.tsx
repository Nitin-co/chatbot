import React, { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isSignIn ? (
        <SignInForm onToggleMode={() => setIsSignIn(false)} />
      ) : (
        <SignUpForm onToggleMode={() => setIsSignIn(true)} />
      )}
    </div>
  )
}