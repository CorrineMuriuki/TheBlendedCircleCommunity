import { useState, useEffect, useRef } from "react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "./MessageBubble";
import { Send, Tag, Lock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WS_URL, API_URL } from "@/config";

interface Message {
  id: number;
  content: string;
  userId: number;
  username: string;
  timestamp: string;
  type?: string;
}

interface ChatSpaceProps {
  id: number;
  name: string;
  isPrivate: boolean;
  memberCount: number;
  currentUser: User;
}

export function ChatSpace({ id, name, isPrivate, memberCount, currentUser }: ChatSpaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Create WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setConnected(true);
      // Join the chat space
      ws.send(JSON.stringify({
        type: 'join',
        userId: currentUser.id,
        username: currentUser.displayName || currentUser.username,
        chatSpaceId: id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' || data.type === 'system') {
          setMessages(prev => [...prev, data]);
        } else if (data.type === 'error') {
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error parsing websocket message:", error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      toast({
        title: "Connection closed",
        description: "You have been disconnected from the chat. Please refresh to reconnect.",
        variant: "destructive"
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection error",
        description: "There was an error connecting to the chat. Please try again.",
        variant: "destructive"
      });
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [id, currentUser, toast]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/chat-spaces/${id}/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          userId: msg.userId,
          username: msg.user.displayName || msg.user.username,
          timestamp: new Date(msg.createdAt).toISOString()
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load chat messages. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchMessages();
  }, [id, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !connected || !socket) return;

    const messageData = {
      type: 'message',
      chatSpaceId: id,
      content: inputMessage.trim(),
      userId: currentUser.id
    };

    socket.send(JSON.stringify(messageData));
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-neutral-light flex items-center justify-between">
        <div className="flex items-center">
          {isPrivate ? <Lock size={20} className="mr-2" /> : <Tag size={20} className="mr-2" />}
          <h3 className="font-medium">{name}</h3>
        </div>
        <div className="flex items-center text-sm text-neutral">
          <Users size={16} className="mr-1" />
          <span>{memberCount} members</span>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {messages.map((message, index) => {
          const isCurrentUser = message.userId === currentUser.id;
          
          // Check if it's a system message
          if (message.type === 'system') {
            return (
              <div key={index} className="flex justify-center">
                <Badge variant="outline" className="bg-neutral-100 text-neutral-600">
                  {message.content}
                </Badge>
              </div>
            );
          }
          
          return (
            <MessageBubble
              key={index}
              content={message.content}
              username={message.username}
              timestamp={message.timestamp}
              isCurrentUser={isCurrentUser}
              initials={message.username.substring(0, 2).toUpperCase()}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-neutral-light">
        <div className="relative">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 py-3 pr-10 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={!connected}
          />
          <Button
            onClick={sendMessage}
            disabled={!connected || !inputMessage.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary hover:text-primary-dark bg-transparent"
            variant="ghost"
            size="icon"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
