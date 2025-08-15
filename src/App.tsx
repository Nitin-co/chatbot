import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { NhostProvider } from '@nhost/react'
import { ApolloProvider } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import { Layout } from './components/Layout'
import { AuthPage } from './components/auth/AuthPage'
import { ChatPage } from './pages/ChatPage'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <Layout>
      <ChatPage />
    </Layout>
  )
}

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <Router>
          <AppContent />
        </Router>
      </ApolloProvider>
    </NhostProvider>
  )
}

export default App