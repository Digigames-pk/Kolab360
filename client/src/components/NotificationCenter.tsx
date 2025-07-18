import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  BellOff, 
  Moon, 
  Settings, 
  MessageSquare, 
  AtSign, 
  Hash, 
  Users, 
  File, 
  Calendar,
  Clock,
  Check,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Monitor
} from "lucide-react";

interface Notification {
  id: string;
  type: "mention" | "message" | "file" | "calendar" | "system";
  title: string;
  content: string;
  channel?: string;
  author: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

interface NotificationSettings {
  desktop: boolean;
  mobile: boolean;
  email: boolean;
  sound: boolean;
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
  channels: Record<string, boolean>;
  keywords: string[];
  mentions: boolean;
  directMessages: boolean;
  files: boolean;
  calendar: boolean;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "mention",
      title: "You were mentioned in #general",
      content: "@you Could you review the latest design mockups when you have a chance?",
      channel: "general",
      author: "Sarah Wilson",
      timestamp: "2024-01-24T10:30:00Z",
      read: false,
      priority: "high"
    },
    {
      id: "2",
      type: "message",
      title: "New message in #dev-team",
      content: "The API endpoints are ready for testing. Let me know if you encounter any issues.",
      channel: "dev-team",
      author: "Mike Chen",
      timestamp: "2024-01-24T09:45:00Z",
      read: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "file",
      title: "File shared in #general",
      content: "project-proposal.pdf shared by Alex Johnson",
      channel: "general",
      author: "Alex Johnson",
      timestamp: "2024-01-24T09:15:00Z",
      read: true,
      priority: "low"
    },
    {
      id: "4",
      type: "calendar",
      title: "Meeting reminder",
      content: "Sprint Planning meeting starts in 15 minutes",
      author: "Calendar",
      timestamp: "2024-01-24T08:45:00Z",
      read: false,
      priority: "high"
    },
    {
      id: "5",
      type: "system",
      title: "System update",
      content: "New features have been added to the task board. Check them out!",
      author: "System",
      timestamp: "2024-01-23T16:00:00Z",
      read: true,
      priority: "low"
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    desktop: true,
    mobile: true,
    email: false,
    sound: true,
    dndEnabled: false,
    dndStart: "22:00",
    dndEnd: "08:00",
    channels: {
      general: true,
      "dev-team": true,
      random: false,
      announcements: true
    },
    keywords: ["urgent", "bug", "deploy"],
    mentions: true,
    directMessages: true,
    files: true,
    calendar: true
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const isDNDActive = settings.dndEnabled && isWithinDNDHours();

  function isWithinDNDHours(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = settings.dndStart.split(':').map(Number);
    const [endHour, endMin] = settings.dndEnd.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention": return <AtSign className="h-4 w-4" />;
      case "message": return <MessageSquare className="h-4 w-4" />;
      case "file": return <File className="h-4 w-4" />;
      case "calendar": return <Calendar className="h-4 w-4" />;
      case "system": return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string, priority: string) => {
    const colors = {
      mention: priority === "high" ? "bg-red-500" : "bg-blue-500",
      message: "bg-green-500",
      file: "bg-purple-500",
      calendar: "bg-orange-500",
      system: "bg-gray-500"
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  return (
    <div className="relative">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            {isDNDActive ? (
              <BellOff className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            {isDNDActive && (
              <Moon className="absolute -bottom-1 -right-1 h-3 w-3 text-purple-500" />
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {isDNDActive && (
                  <Badge variant="outline" className="ml-2">
                    <Moon className="h-3 w-3 mr-1" />
                    Do Not Disturb
                  </Badge>
                )}
              </DialogTitle>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Notification Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* General Settings */}
                      <div className="space-y-4">
                        <h4 className="font-medium">General</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Monitor className="h-4 w-4" />
                              <span>Desktop notifications</span>
                            </div>
                            <Switch 
                              checked={settings.desktop}
                              onCheckedChange={(checked) => setSettings({...settings, desktop: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4" />
                              <span>Mobile push notifications</span>
                            </div>
                            <Switch 
                              checked={settings.mobile}
                              onCheckedChange={(checked) => setSettings({...settings, mobile: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>Email notifications</span>
                            </div>
                            <Switch 
                              checked={settings.email}
                              onCheckedChange={(checked) => setSettings({...settings, email: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                              <span>Sound alerts</span>
                            </div>
                            <Switch 
                              checked={settings.sound}
                              onCheckedChange={(checked) => setSettings({...settings, sound: checked})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Do Not Disturb */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Do Not Disturb</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Moon className="h-4 w-4" />
                              <span>Enable Do Not Disturb</span>
                            </div>
                            <Switch 
                              checked={settings.dndEnabled}
                              onCheckedChange={(checked) => setSettings({...settings, dndEnabled: checked})}
                            />
                          </div>
                          
                          {settings.dndEnabled && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-sm text-muted-foreground">Start time</label>
                                <Select 
                                  value={settings.dndStart} 
                                  onValueChange={(value) => setSettings({...settings, dndStart: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({length: 24}, (_, i) => (
                                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                        {i.toString().padStart(2, '0')}:00
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground">End time</label>
                                <Select 
                                  value={settings.dndEnd} 
                                  onValueChange={(value) => setSettings({...settings, dndEnd: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({length: 24}, (_, i) => (
                                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                        {i.toString().padStart(2, '0')}:00
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Types */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Notification Types</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AtSign className="h-4 w-4" />
                              <span>@mentions and replies</span>
                            </div>
                            <Switch 
                              checked={settings.mentions}
                              onCheckedChange={(checked) => setSettings({...settings, mentions: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>Direct messages</span>
                            </div>
                            <Switch 
                              checked={settings.directMessages}
                              onCheckedChange={(checked) => setSettings({...settings, directMessages: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4" />
                              <span>File uploads</span>
                            </div>
                            <Switch 
                              checked={settings.files}
                              onCheckedChange={(checked) => setSettings({...settings, files: checked})}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Calendar reminders</span>
                            </div>
                            <Switch 
                              checked={settings.calendar}
                              onCheckedChange={(checked) => setSettings({...settings, calendar: checked})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col p-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="mention">Mentions</TabsTrigger>
                <TabsTrigger value="message">Messages</TabsTrigger>
                <TabsTrigger value="file">Files</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="flex-1 mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-muted-foreground">No notifications to show</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <Card 
                          key={notification.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${getTypeColor(notification.type, notification.priority)} text-white`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{notification.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {notification.content}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                                      <span>{notification.author}</span>
                                      {notification.channel && (
                                        <>
                                          <span>•</span>
                                          <Hash className="h-3 w-3" />
                                          <span>{notification.channel}</span>
                                        </>
                                      )}
                                      <span>•</span>
                                      <Clock className="h-3 w-3" />
                                      <span>{formatTime(notification.timestamp)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 ml-2">
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}