import { apolloClient } from './apollo';
import { 
  GET_CHATS, 
  GET_MESSAGES, 
  CREATE_CHAT, 
  INSERT_MESSAGE, 
  DELETE_CHAT 
} from './queries';

// 1️⃣ Get all chats with the latest message
export const getChats = async () => {
  const { data } = await apolloClient.query({ 
    query: GET_CHATS, 
    fetchPolicy: 'network-only' 
  });
  return data.chats;
};

// 2️⃣ Get all messages for a specific chat
export const getMessages = async (chatId: string) => {
  if (!chatId) throw new Error("chatId is required and must be a valid UUID");
  
  const { data } = await apolloClient.query({
    query: GET_MESSAGES,
    variables: { chatId },
    fetchPolicy: 'network-only'
  });
  return data.messages;
};

// 3️⃣ Create a new chat
export const createChat = async () => {
  const { data } = await apolloClient.mutate({ mutation: CREATE_CHAT });
  return data.insert_chats_one; // returns { id, created_at }
};

// 4️⃣ Send a message in a chat
export const sendMessage = async (chatId: string, text: string, sender: string) => {
  if (!chatId) throw new Error("chatId is required and must be a valid UUID");

  const { data } = await apolloClient.mutate({
    mutation: INSERT_MESSAGE,
    variables: { chatId, text, sender },
  });
  return data.insert_messages_one;
};

// 5️⃣ Delete a chat
export const deleteChat = async (chatId: string) => {
  if (!chatId) throw new Error("chatId is required and must be a valid UUID");

  const { data } = await apolloClient.mutate({
    mutation: DELETE_CHAT,
    variables: { chatId },
  });
  return data.delete_chats_by_pk;
};
