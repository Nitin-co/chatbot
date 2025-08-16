import { gql } from "@apollo/client";

// Get chats with latest message
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
`;

// Subscribe to chats with latest message
export const SUBSCRIBE_TO_CHATS = gql`
  subscription SubscribeToChats {
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
`;

// Create a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
      created_at
    }
  }
`;

export const SUBSCRIBE_TO_MESSAGES = gql`
  subscription SubscribeToMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: desc }) {
      id
      text
      sender
      created_at
    }
  }
`;
