import { NhostClient } from '@nhost/nhost-js'

// ✅ Initialize Nhost client
const nhost = new NhostClient({
  subdomain: "rvmtvbxomszjibeiocvu", // replace with your actual subdomain
  region: "eu-central-1" // your Hasura region
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
