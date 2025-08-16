import { nhost } from '@nhost/nhost-js'

// Sign in first
await nhost.auth.signIn({
  email: 'test@example.com',
  password: 'password123'
})

// Now GraphQL requests will include the JWT with X-Hasura-User-Id
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
