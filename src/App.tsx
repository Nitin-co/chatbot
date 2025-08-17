import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthenticationStatus } from '@nhost/react'

import { Layout } from './components/Layout'
import { AuthPage } from './components/auth/AuthPage'
import { ChatPage } from './pages/ChatPage'

const EmailVerificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now sign in to your account.
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  )
}

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Require verified email before allowing access
  if (isAuthenticated && user && user.emailVerified === false) {
    return <EmailVerificationPage />
  }

  return (
    <Routes>
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <AuthPage />
          ) : (
            <Layout>
              <ChatPage />
            </Layout>
          )
        }
      />
    </Routes>
  )
}

function App() {
  // 🚨 Removed NhostProvider & ApolloProvider here
  // Those should only be in `main.tsx`
  return <AppContent />
}

export default App
