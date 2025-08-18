import React, { useState } from 'react'
import { sendMessage } from '/home/project/src/graphql/queries'
import { Message } from '/home/project/src/graphql/queries'

interface MessageInputProps {
  chatId: string
  onSend: (message: Message) => void
}

export const MessageInput: React.FC<MessageInputProps> = ({ chatId, onSend }) => {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      const newMessage = await sendMessage(chatId, text, 'user')
      onSend(newMessage)
      setText('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-2 border-t border-gray-200 flex">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={sending}
        className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  )
}
