import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";
import { nhost } from "/home/project/src/lib/nhost.ts";

const GET_MESSAGES = gql`
  query GetMessages {
    messages(order_by: { created_at: asc }) {
      id
      content
      created_at
      user {
        id
        displayName
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($content: String!, $user_id: uuid!) {
    insert_messages_one(object: { content: $content, user_id: $user_id }) {
      id
      content
      created_at
    }
  }
`;

export default function ChatList() {
  const { data, loading, error } = useQuery(GET_MESSAGES, {
    fetchPolicy: "cache-and-network",
    pollInterval: 2000, // keep refreshing
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const user = nhost.auth.getUser();
    if (!user) {
      alert("You must be logged in to send messages");
      return;
    }

    try {
      await sendMessage({
        variables: { content: newMessage, user_id: user.id },
        refetchQueries: [{ query: GET_MESSAGES }],
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="p-4">
      <div className="space-y-2 mb-4">
        {data?.messages.map((msg: any) => (
          <div key={msg.id} className="p-2 bg-gray-100 rounded">
            <strong>{msg.user?.displayName || "Anonymous"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
