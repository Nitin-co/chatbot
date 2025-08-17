import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { NhostProvider } from "@nhost/react";
import { ApolloProvider } from "@apollo/client";
import { nhost } from "./lib/nhost";
import { apolloClient } from "./lib/apollo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </NhostProvider>
  </StrictMode>
);

