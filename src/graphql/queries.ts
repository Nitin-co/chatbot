// src/graphql/queries.ts
import { gql } from '@apollo/client'

// Fetch all chats with the latest message
export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) {
      id
      created_at
      messages(limit: 1, order_by: { created_at: desc }) {
        id
        text
        sender
        created_at
      }
    }
  }
`

// Create a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      created_at
    }
  }
`

// Delete a chat
export const DELETE_CHAT = gql`
  mutation DeleteChat($chat_id: uuid!) {
    delete_chats_by_pk(id: $chat_id) {
      id
    }
  }
`

// Fetch messages for a chat
export const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      text
      sender
      created_at
    }
  }
`

// Insert a message in a chat
export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $text: String!, $sender: String!) {
    insert_messages_one(object: { chat_id: $chat_id, text: $text, sender: $sender }) {
      id
      text
      sender
      created_at
    }
  }
`
