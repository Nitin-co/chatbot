import { gql } from '@apollo/client'

export const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
      created_at
    }
  }
`

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

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $message: String!) {
    sendMessage(chat_id: $chat_id, message: $message) {
      success
      message
    }
  }
`