# Hasura Database Setup Instructions

## 1. Database Schema

### Create Tables

```sql
-- Users table (managed by Nhost Auth)
-- Nhost automatically creates the auth.users table

-- Chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_created_at ON public.chats(created_at);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
```

## 2. Row Level Security (RLS)

### Enable RLS on tables

```sql
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

```sql
-- Chats policies
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chats" ON public.chats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chats" ON public.chats
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own chats" ON public.chats
  FOR DELETE USING (user_id = auth.uid());

-- Messages policies  
CREATE POLICY "Users can view messages in own chats" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own chats" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in own chats" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own chats" ON public.messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );
```

## 3. Hasura Permissions

### Configure table permissions in Hasura Console:

#### Chats Table - Role: user
- **Select**: Custom check: `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
- **Insert**: Custom check: `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
- **Update**: Custom check: `{"user_id":{"_eq":"X-Hasura-User-Id"}}`  
- **Delete**: Custom check: `{"user_id":{"_eq":"X-Hasura-User-Id"}}`

#### Messages Table - Role: user  
- **Select**: Custom check: `{"chat":{"user_id":{"_eq":"X-Hasura-User-Id"}}}`
- **Insert**: Custom check: `{"chat":{"user_id":{"_eq":"X-Hasura-User-Id"}}}`
- **Update**: Custom check: `{"chat":{"user_id":{"_eq":"X-Hasura-User-Id"}}}`
- **Delete**: Custom check: `{"chat":{"user_id":{"_eq":"X-Hasura-User-Id"}}}`

## 4. Hasura Action Setup

### Create sendMessage Action

1. Go to Hasura Console > Actions
2. Create new action with these details:

**Action Definition:**
```graphql
type Mutation {
  sendMessage(chat_id: uuid!, message: String!): SendMessageOutput
}

type SendMessageOutput {
  success: Boolean!
  message: String
}
```

**Handler URL:** `https://your-n8n-instance.com/webhook/hasura-send-message`

**Headers:**
```json
{
  "X-Hasura-User-Id": "{{$session_variables['x-hasura-user-id']}}",
  "Authorization": "Bearer YOUR_N8N_WEBHOOK_TOKEN"
}
```

**Permissions:**
- Role: `user` (checked)

## 5. Relationships

### Set up table relationships in Hasura Console:

#### Chats table:
- `messages`: Array relationship to `messages` table using `chats.id -> messages.chat_id`
- `user`: Object relationship to `auth.users` table using `chats.user_id -> auth.users.id`

#### Messages table:
- `chat`: Object relationship to `chats` table using `messages.chat_id -> chats.id`

## 6. Test Queries

After setup, test these queries in Hasura GraphiQL:

```graphql
# Get user's chats
query GetChats {
  chats(order_by: {created_at: desc}) {
    id
    created_at
    messages(limit: 1, order_by: {created_at: desc}) {
      text
      sender
    }
  }
}

# Get messages for a chat
query GetMessages($chat_id: uuid!) {
  messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
    id
    text
    sender
    created_at
  }
}

# Create a new chat
mutation CreateChat {
  insert_chats_one(object: {}) {
    id
    created_at
  }
}
```