import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, Search, Filter } from 'lucide-react';
import { db } from '@/lib/firebase';
import { onSnapshot, collection, query, where, orderBy, getDocs, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  recipient_id: string;
}

const Notifications = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
      
      // Real-time subscription using Firebase
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', profile.id)
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, () => {
        fetchNotifications();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [profile?.id]);

  const fetchNotifications = async () => {
    if (!profile?.id) return;

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', profile.id)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Notification[];
      
      // Sort by created_at manually since we removed orderBy
      notificationsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', profile.id),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all as read.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      toast({
        title: "Success",
        description: "Notification deleted.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'read' && notification.read) ||
                         (filterType === 'unread' && !notification.read);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Notifications" subtitle="Manage your notifications and stay updated" actions={unreadCount > 0 ? <Button onClick={markAllAsRead} className="bg-primary hover:bg-primary/90"><Check className="h-4 w-4 mr-2"/>Mark All Read ({unreadCount})</Button> : null} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>All Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:w-64"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const types = ['all', 'unread', 'read'] as const;
                  const currentIndex = types.indexOf(filterType);
                  const nextIndex = (currentIndex + 1) % types.length;
                  setFilterType(types[nextIndex]);
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchTerm || filterType !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You\'ll see notifications here when they arrive.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    notification.read
                      ? 'bg-muted/30 border-muted'
                      : 'bg-card border-primary/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="hover:bg-green-100 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="hover:bg-red-100 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;