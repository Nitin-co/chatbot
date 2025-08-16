import { gql } from '@apollo/client'

// Create a new chat (Hasura presets user_id from X-Hasura-User-Id)
export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      created_at
      title
    }
  }
`

// Insert a message
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

// Hasura Action → triggers n8n → OpenRouter → inserts bot message and returns it
export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $text: String!) {
    sendMessage(chat_id: $chat_id, text: $text) {
      id
      text
      sender
      created_at
    }
  }
`

export const DELETE_CHAT = gql`
  mutation DeleteChat($chat_id: uuid!) {
    delete_chats_by_pk(id: $chat_id) {
      id
    }
  }
`
