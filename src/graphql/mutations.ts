import { gql } from '@apollo/client'

// Create a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
      created_at
    }
  }
`

// Insert a message directly (optional, mostly for testing)
export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $text: String!, $sender: String!) {
    insert_messages_one(object: {
      chat_id: $chat_id
      text: $text
      sender: $sender
    }) {
      id
      text
      sender
      created_at
    }
  }
`

// ✅ Use the Hasura Action for sending a message and triggering the chatbot
export const SEND_MESSAGE = gql`
  mutation SendMessage($chat_id: uuid!, $text: String!) {
    sendMessage(input: { chat_id: $chat_id, text: $text }) {
      id
      chat_id
      sender
      text
      created_at
    }
  }
`
