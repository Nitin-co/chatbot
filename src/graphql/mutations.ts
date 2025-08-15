import { gql } from '@apollo/client'

// Mutation to insert a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
      created_at
    }
  }
`

// Mutation to insert a message (user or bot)
export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $text: String!, $sender: String!) {
    insert_messages_one(
      object: {
        chat_id: $chat_id
        text: $text
        sender: $sender
      }
    ) {
      id
      text
      sender
      created_at
    }
  }
`

// Mutation corresponding to your Hasura action sendMessage
export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $message: String!) {
    sendMessage(input: { chat_id: $chat_id, text: $message }) {
      id
      chat_id
      sender
      text
      created_at
    }
  }
`
