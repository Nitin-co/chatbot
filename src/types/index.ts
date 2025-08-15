export interface Chat {
  id: string
  created_at: string
  messages: Message[]
}

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  created_at: string
  chat_id?: string
}

export interface User {
  id: string
  email: string
}