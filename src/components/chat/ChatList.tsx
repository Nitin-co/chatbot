import React, { useEffect, useState } from "react";
import { nhost } from "/home/project/src/graphql/queries.ts";
import { gql } from "graphql-request";
import { useAuthenticationStatus } from "@nhost/react";
import { useQuery } from "@tanstack/react-query";

const GET_CHATS = gql`
  query GetChats {
    messages(order_by: { created_at: desc }, limit: 20) {
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

export const ChatList: React.FC = () => {
  const { isAuthenticated } = useAuthenticationStatus();
  const [client] = useState(() => nhost.graphql);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await client.request(GET_CHATS);
      return res.messages;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  if (!isAuthenticated) {
    return <p className="text-gray-500">Please log in to view chats.</p>;
  }

  if (isLoading) {
    return <p className="text-gray-500">Loading chats...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error loading chats.</p>;
  }

  return (
    <div className="space-y-3 p-4">
      {data?.map((msg: any) => (
        <div
          key={msg.id}
          className="p-3 bg-white shadow rounded-lg border border-gray-200"
        >
          <p className="text-sm font-semibold">{msg.user.displayName}</p>
          <p className="text-gray-700">{msg.content}</p>
          <span className="text-xs text-gray-400">
            {new Date(msg.created_at).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};
