# Deployment Guide

## 1. Nhost Setup

1. **Create Nhost Account**: Go to [console.nhost.io](https://console.nhost.io)
2. **Create New Project**: 
   - Choose region (eu-central-1 recommended)
   - Note your subdomain
3. **Environment Variables**: Update your `.env` file:
   ```env
   VITE_NHOST_SUBDOMAIN=your-project-subdomain
   VITE_NHOST_REGION=eu-central-1
   ```

## 2. Database Setup

1. **Run SQL Schema**: In Nhost Console > Database > SQL Editor, run the SQL from `hasura-setup.md`
2. **Configure Hasura**: In Nhost Console > Hasura
   - Set up table permissions as described in `hasura-setup.md`  
   - Create the `sendMessage` action
   - Configure relationships

## 3. n8n Setup

### Option A: n8n Cloud (Recommended)
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import the workflow from `n8n-workflow.json`
3. Set environment variables in n8n:
   - `NHOST_ADMIN_SECRET`: Get from Nhost Console > Settings > Environment Variables
   - `NHOST_GRAPHQL_URL`: Your Nhost GraphQL endpoint
   - `OPENROUTER_API_KEY`: Get from [openrouter.ai](https://openrouter.ai)
4. Activate the workflow
5. Copy the webhook URL for Hasura Action

### Option B: Self-hosted n8n
1. Deploy n8n using Docker:
   ```bash
   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```
2. Import workflow and configure environment variables
3. Use ngrok or similar for webhook access:
   ```bash
   ngrok http 5678
   ```

## 4. Frontend Deployment on Netlify

### Automatic Deployment (Recommended)
1. Push your code to GitHub
2. Connect repository to Netlify
3. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
4. Environment variables in Netlify:
   ```
   VITE_NHOST_SUBDOMAIN=your-project-subdomain
   VITE_NHOST_REGION=eu-central-1
   ```

### Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to Netlify:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

## 5. Final Configuration

1. **Update Hasura Action URL**: In Nhost Console > Hasura > Actions
   - Update `sendMessage` action handler URL to your n8n webhook URL
2. **Test the Application**:
   - Sign up/sign in
   - Create a chat
   - Send a message
   - Verify AI response

## 6. Environment Variables Summary

### Frontend (.env)
```env
VITE_NHOST_SUBDOMAIN=your-project-subdomain
VITE_NHOST_REGION=eu-central-1
```

### n8n Environment Variables
```env
NHOST_ADMIN_SECRET=your-nhost-admin-secret
NHOST_GRAPHQL_URL=https://your-subdomain.nhost.run/v1/graphql
OPENROUTER_API_KEY=your-openrouter-api-key
```

## 7. Monitoring & Debugging

- **Nhost Logs**: Console > Logs
- **n8n Execution History**: Workflow executions tab
- **Frontend Errors**: Browser DevTools Console
- **Network Issues**: Browser DevTools Network tab

## 8. Security Considerations

- Never expose admin secrets in frontend
- All API calls go through authenticated GraphQL
- Row Level Security enforced on database
- Webhook endpoints should use authentication tokens
- Regular security updates for all dependencies