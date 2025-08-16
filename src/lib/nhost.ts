// src/lib/nhost.ts
import { NhostClient } from '@nhost/nhost-js'

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'rvmtvbxomszjibeiocvu',
  region: import.meta.env.VITE_NHOST_REGION || 'eu-central-1',
})

// Optional: sign in automatically for dev/testing
;(async () => {
  const session = await nhost.auth.getSession()
  if (!session) {
    await nhost.auth.signIn({
      email: 'test@example.com',
      password: 'password123',
    })
  }
})()
