import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  MessageCircle, 
  Search, 
  Users, 
  Circle, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  MessageSquare
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id?: string;
  profile_photo?: string;
  last_seen?: string;
  is_online?: boolean;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read?: boolean;
  message_type?: 'text' | 'image' | 'file';
  sender?: User;
}

interface Conversation {
  user: User;
  lastMessage?: Message;
  unreadCount: number;
  timestamp?: string;
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
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchUsers();
      fetchConversations();
      
      // Real-time subscription for messages
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

      return () => unsubscribe();
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

      if (profile.role === 'teacher' || profile.role === 'headmaster' || profile.role === 'accountant') {
        usersQuery = query(
          collection(db, 'users'),
          where('branch_id', '==', profile.branch_id)
        );
      }

      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs
        .map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          is_online: Math.random() > 0.5, // Mock online status
          last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }))
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

      const conversationMap = new Map<string, Conversation>();
      
      messagesData?.forEach((message: Message) => {
        const partnerId = message.sender_id === profile.id ? message.receiver_id : message.sender_id;
        const partner = users.find(u => u.id === partnerId);
        
        if (partner && !conversationMap.has(partnerId)) {
          const unreadCount = messagesData.filter(m => 
            m.sender_id === partnerId && 
            m.receiver_id === profile.id &&
            !m.read
          ).length;

          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount,
            timestamp: message.created_at
          });
        }
      });

      const sortedConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

      setConversations(sortedConversations);
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

    const tempMessage = {
      id: 'temp-' + Date.now(),
      content: newMessage.trim(),
      sender_id: profile.id,
      receiver_id: selectedUser.id,
      created_at: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage.trim(),
        sender_id: profile.id,
        receiver_id: selectedUser.id,
        created_at: Timestamp.now(),
        read: false,
        message_type: 'text'
      });

      fetchMessages(selectedUser.id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
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
    const colors = {
      admin: 'bg-red-500',
      headmaster: 'bg-blue-500',
      teacher: 'bg-green-500',
      accountant: 'bg-purple-500',
      parent: 'bg-orange-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== profile?.id) return null;
    
    if (message.id.startsWith('temp-')) {
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
    
    return message.read ? 
      <CheckCheck className="h-3 w-3 text-blue-500" /> : 
      <Check className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Team Chat
              </h1>
              <p className="text-sm text-muted-foreground">
                Stay connected with your colleagues
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {users.filter(u => u.is_online).length} Online
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar - Conversations */}
        <div className="w-80 border-r bg-card/30 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/60"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="p-2">
                {/* Recent Conversations */}
                {conversations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
                      Recent Chats
                    </h3>
                    <div className="space-y-1">
                      {conversations.slice(0, 5).map((conversation) => (
                        <div
                          key={conversation.user.id}
                          onClick={() => startConversation(conversation.user)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent/50 group",
                            selectedUser?.id === conversation.user.id && "bg-primary/10 hover:bg-primary/15"
                          )}
                        >
                          <div className="relative">
                            <Avatar className="h-11 w-11">
                              <AvatarImage src={conversation.user.profile_photo} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                {getUserInitials(conversation.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.user.is_online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                            <div className={cn(
                              "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                              getRoleColor(conversation.user.role)
                            )}></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {conversation.user.name}
                              </p>
                              {conversation.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(conversation.lastMessage.created_at)}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Users */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
                    All Members
                  </h3>
                  <div className="space-y-1">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => startConversation(user)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent/50 group",
                          selectedUser?.id === user.id && "bg-primary/10 hover:bg-primary/15"
                        )}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_photo} />
                            <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-foreground">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          {user.is_online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.role}
                            </Badge>
                            {user.is_online ? (
                              <span className="text-xs text-green-500">Online</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Last seen {formatMessageTime(user.last_seen || new Date().toISOString())}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="border-b bg-card/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedUser.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {getUserInitials(selectedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedUser.role}
                        </Badge>
                        <span className="text-muted-foreground">
                          {selectedUser.is_online ? 'Online' : `Last seen ${formatMessageTime(selectedUser.last_seen || new Date().toISOString())}`}
                        </span>
                        {typing && (
                          <span className="text-xs text-primary animate-pulse">typing...</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender_id === profile?.id;
                    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                    const showTimestamp = index === 0 || 
                      new Date(message.created_at).getTime() - new Date(messages[index - 1]?.created_at).getTime() > 300000; // 5 minutes

                    return (
                      <div key={message.id}>
                        {showTimestamp && (
                          <div className="flex justify-center my-4">
                            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                              {new Date(message.created_at).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "flex gap-3 animate-fade-in",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}>
                          {!isOwnMessage && showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedUser.profile_photo} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-muted/50">
                                {getUserInitials(selectedUser.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          {!isOwnMessage && !showAvatar && <div className="w-8" />}
                          
                          <div className={cn(
                            "max-w-[70%] group",
                            isOwnMessage ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "relative px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md",
                              isOwnMessage
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-card border rounded-bl-md"
                            )}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              
                              <div className={cn(
                                "flex items-center gap-1 mt-1 text-xs opacity-70",
                                isOwnMessage ? "justify-end" : "justify-start"
                              )}>
                                <span>{formatMessageTime(message.created_at)}</span>
                                {getMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-card/30 p-4">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="pr-12 py-3 rounded-2xl border-2 focus:border-primary/50 bg-background"
                      autoComplete="off"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="h-10 w-10 p-0 rounded-full shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <MessageCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Select a colleague from the sidebar to begin chatting, or search for someone specific.
                </p>
                <Badge variant="outline" className="gap-2">
                  <Users className="h-3 w-3" />
                  {users.length} members available
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;