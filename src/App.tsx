import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { NhostProvider } from '@nhost/react'
import { ApolloProvider } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { nhost } from '/home/project/src/lib/nhost.ts'
import { apolloClient } from '/home/project/src/lib/apollo.ts'
import { Layout } from '/home/project/src/components/Layout.tsx'
import { AuthPage } from '/home/project/src/components/auth/AuthPage.tsx'
import { ChatPage } from '/home/project/src/pages/ChatPage.tsx'

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