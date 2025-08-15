import React, { useState } from 'react'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

export const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true)

  return isSignIn ? (
    <SignInForm onToggleMode={() => setIsSignIn(false)} />
  ) : (
    <SignUpForm onToggleMode={() => setIsSignIn(true)} />
  )
}