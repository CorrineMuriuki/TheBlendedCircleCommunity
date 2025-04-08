import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { ChatMessage, InsertChatMessage } from '@shared/schema';

interface ChatClient {
  id: number;
  userId?: number;
  username?: string;
  chatSpaceId?: number;
  ws: WebSocket;
}

interface ChatMessagePayload {
  type: 'message';
  chatSpaceId: number;
  content: string;
  userId: number;
}

interface JoinSpacePayload {
  type: 'join';
  userId: number;
  username: string;
  chatSpaceId: number;
}

type WebSocketPayload = ChatMessagePayload | JoinSpacePayload;

export function setupWebSocket(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: Map<number, ChatClient> = new Map();
  let clientIdCounter = 1;

  wss.on('connection', (ws) => {
    const clientId = clientIdCounter++;
    clients.set(clientId, { id: clientId, ws });

    ws.on('message', async (message: string) => {
      try {
        const data: WebSocketPayload = JSON.parse(message);
        
        // Handle joining a chat space
        if (data.type === 'join') {
          const { userId, username, chatSpaceId } = data;
          
          // Check if space exists
          const space = await storage.getChatSpaceById(chatSpaceId);
          if (!space) {
            sendErrorToClient(ws, 'Chat space not found');
            return;
          }
          
          // Check if user has access to this space
          if (space.isPrivate && !(await storage.hasAccessToChatSpace(userId, chatSpaceId))) {
            sendErrorToClient(ws, 'You do not have access to this chat space');
            return;
          }
          
          // Update client information
          const client = clients.get(clientId);
          if (client) {
            client.userId = userId;
            client.username = username;
            client.chatSpaceId = chatSpaceId;
            clients.set(clientId, client);
            
            // Send confirmation to client
            ws.send(JSON.stringify({
              type: 'joined',
              chatSpaceId,
              message: `Joined ${space.name}`
            }));
            
            // Send system message that a new user joined (optional)
            broadcastToChatSpace(chatSpaceId, {
              type: 'system',
              message: `${username} joined the chat`,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // Handle new chat message
        if (data.type === 'message') {
          const { userId, chatSpaceId, content } = data;
          
          // Validate user and chat space
          const user = await storage.getUser(userId);
          const space = await storage.getChatSpaceById(chatSpaceId);
          
          if (!user || !space) {
            sendErrorToClient(ws, 'Invalid user or chat space');
            return;
          }
          
          // Check if user has access to this space
          if (space.isPrivate && !(await storage.hasAccessToChatSpace(userId, chatSpaceId))) {
            sendErrorToClient(ws, 'You do not have access to this chat space');
            return;
          }
          
          // Create message in storage
          const messageData: InsertChatMessage = {
            content,
            type: 'text',
            chatSpaceId,
            userId
          };
          
          const savedMessage = await storage.createChatMessage(messageData);
          
          // Broadcast to all clients in the same chat space
          broadcastToChatSpace(chatSpaceId, {
            type: 'message',
            id: savedMessage.id,
            content: savedMessage.content,
            userId: savedMessage.userId,
            username: user.displayName || user.username,
            timestamp: savedMessage.createdAt.toISOString()
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendErrorToClient(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      const client = clients.get(clientId);
      if (client && client.chatSpaceId && client.username) {
        // Notify others that user left
        broadcastToChatSpace(client.chatSpaceId, {
          type: 'system',
          message: `${client.username} left the chat`,
          timestamp: new Date().toISOString()
        });
      }
      clients.delete(clientId);
    });
  });

  function sendErrorToClient(ws: WebSocket, message: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message
      }));
    }
  }

  function broadcastToChatSpace(chatSpaceId: number, message: any): void {
    const payload = JSON.stringify(message);
    clients.forEach(client => {
      if (client.chatSpaceId === chatSpaceId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }
}
