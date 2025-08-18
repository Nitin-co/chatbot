import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "/src/App"
import "/src/index.css"

import { NhostProvider } from "@nhost/react"
import { ApolloProvider } from "@apollo/client"
import { BrowserRouter } from "react-router-dom"
import { nhost } from "/src/lib/nhost"
import { apolloClient } from "/src/lib/apollo"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </NhostProvider>
  </StrictMode>
)
