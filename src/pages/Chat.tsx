import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle, Search, Users, Circle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  Timestamp,
  or
} from 'firebase/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id?: string;
  profile_photo?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender?: User;
}

interface Conversation {
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

const Chat = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchUsers();
      fetchConversations();
      
      // Real-time subscription for messages using Firebase
      const messagesQuery = query(
        collection(db, 'messages'),
        or(
          where('sender_id', '==', profile.id),
          where('receiver_id', '==', profile.id)
        )
      );
      
      const unsubscribe = onSnapshot(messagesQuery, () => {
        if (selectedUser?.id) {
          fetchMessages(selectedUser.id);
        }
        fetchConversations();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [profile?.id, selectedUser?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    if (!profile?.id) return;

    try {
      let usersQuery = query(collection(db, 'users'));

      // Branch-based filtering for Firebase
      if (profile.role === 'teacher' || profile.role === 'headmaster' || profile.role === 'accountant') {
        usersQuery = query(
          collection(db, 'users'),
          where('branch_id', '==', profile.branch_id)
        );
      }
      // Admin can chat with everyone (no filter)

      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== profile.id) as User[];

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    if (!profile?.id) return;

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        or(
          where('sender_id', '==', profile.id),
          where('receiver_id', '==', profile.id)
        ),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(messagesQuery);
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Message[];

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      messagesData?.forEach((message: Message) => {
        const partnerId = message.sender_id === profile.id ? message.receiver_id : message.sender_id;
        const partner = users.find(u => u.id === partnerId);
        
        if (partner && !conversationMap.has(partnerId)) {
          const unreadCount = messagesData.filter(m => 
            m.sender_id === partnerId && 
            m.receiver_id === profile.id
            // TODO: Add read status to messages table
          ).length;

          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount: 0 // Simplified for now
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    if (!profile?.id) return;

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        orderBy('created_at', 'asc')
      );

      const snapshot = await getDocs(messagesQuery);
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Message[];

      // Filter messages for this conversation
      const conversationMessages = allMessages.filter(message => 
        (message.sender_id === profile.id && message.receiver_id === userId) ||
        (message.sender_id === userId && message.receiver_id === profile.id)
      );

      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !profile?.id) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage.trim(),
        sender_id: profile.id,
        receiver_id: selectedUser.id,
        created_at: Timestamp.now(),
        read: false
      });

      setNewMessage('');
      fetchMessages(selectedUser.id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const startConversation = (user: User) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'headmaster': return 'bg-blue-500';
      case 'teacher': return 'bg-green-500';
      case 'accountant': return 'bg-purple-500';
      case 'parent': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Chat</h1>
        <p className="text-muted-foreground">
          Connect and communicate with your team members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Users & Conversations List */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Users
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-1 p-4">
                  {filteredUsers.map((user) => {
                    const conversation = conversations.find(c => c.user.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => startConversation(user)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedUser?.id === user.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.profile_photo} />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getRoleColor(user.role)}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{user.name}</p>
                            {conversation?.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.role}
                            </Badge>
                            {conversation?.lastMessage && (
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-8">
          {selectedUser ? (
            <>
              <CardHeader className="flex flex-row items-center gap-3 border-b">
                <Avatar>
                  <AvatarImage src={selectedUser.profile_photo} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {getUserInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedUser.role}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-500">
                      <Circle className="h-3 w-3 fill-current" />
                      <span className="text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender_id === profile?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a user to start chatting</p>
                <p className="text-sm">Choose someone from the list to begin a conversation</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;