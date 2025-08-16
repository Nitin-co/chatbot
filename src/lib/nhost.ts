// src/lib/nhost.ts
import { NhostClient } from '@nhost/nhost-js'

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'rvmtvbxomszjibeiocvu',
  region: import.meta.env.VITE_NHOST_REGION || 'eu-central-1',
})


// ✅ Sign in
await nhost.auth.signIn({
  email: 'test@example.com',
  password: 'password123'
})

// ✅ Send GraphQL request with auth
const result = await nhost.graphql.request(`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      user_id
    }
  }
`, { title: 'My first chat' })

console.log(result)
