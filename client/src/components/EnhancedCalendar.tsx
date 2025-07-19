import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Video,
  Phone,
  Mail,
  Bell,
  Star,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Share2,
  Settings
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "meeting" | "call" | "event" | "deadline";
  priority: "low" | "medium" | "high" | "urgent";
  attendees: string[];
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  reminders: number[];
  createdBy: string;
  channel: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  tags: string[];
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

interface EnhancedCalendarProps {
  selectedChannel?: string;
}

export function EnhancedCalendar({ selectedChannel = "general" }: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Sprint Planning Meeting",
      description: "Planning session for the upcoming sprint. Review backlog items and set sprint goals.",
      date: "2024-01-24",
      startTime: "09:00",
      endTime: "10:30",
      type: "meeting",
      priority: "high",
      attendees: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"],
      location: "Conference Room A",
      isVirtual: false,
      reminders: [15, 60],
      createdBy: "John Doe",
      channel: selectedChannel,
      recurring: "weekly",
      tags: ["sprint", "planning", "agile"],
      status: "scheduled"
    },
    {
      id: "2",
      title: "Project Alpha Deadline",
      description: "Final deliverable due for Project Alpha. All components must be tested and documented.",
      date: "2024-01-26",
      startTime: "17:00",
      endTime: "17:00",
      type: "deadline",
      priority: "urgent",
      attendees: ["Alex Johnson", "Lisa Rodriguez"],
      isVirtual: false,
      reminders: [60, 1440],
      createdBy: "Alex Johnson",
      channel: selectedChannel,
      recurring: "none",
      tags: ["deadline", "project", "alpha"],
      status: "scheduled"
    },
    {
      id: "3",
      title: "Client Presentation",
      description: "Present the new features and roadmap to the client. Prepare demo environment.",
      date: "2024-01-25",
      startTime: "14:00",
      endTime: "15:30",
      type: "meeting",
      priority: "high",
      attendees: ["Sarah Wilson", "Mike Chen", "Alex Johnson"],
      isVirtual: true,
      meetingLink: "https://zoom.us/j/1234567890",
      reminders: [30, 120],
      createdBy: "Sarah Wilson",
      channel: selectedChannel,
      recurring: "none",
      tags: ["client", "presentation", "demo"],
      status: "scheduled"
    },
    {
      id: "4",
      title: "Team Standup",
      description: "Daily standup meeting to sync on progress and blockers.",
      date: "2024-01-25",
      startTime: "09:30",
      endTime: "10:00",
      type: "call",
      priority: "medium",
      attendees: ["All Team"],
      isVirtual: true,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      reminders: [5],
      createdBy: "Mike Chen",
      channel: selectedChannel,
      recurring: "daily",
      tags: ["standup", "daily", "sync"],
      status: "scheduled"
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "meeting" as const,
    priority: "medium" as const,
    attendees: "",
    location: "",
    isVirtual: false,
    meetingLink: "",
    reminders: "15,60",
    recurring: "none" as const,
    tags: ""
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr && event.channel === selectedChannel);
  };

  const getEventTypeColor = (type: string, priority: string) => {
    const baseColors = {
      meeting: "blue",
      call: "green", 
      event: "purple",
      deadline: "red"
    };
    
    const intensities = {
      low: "400",
      medium: "500",
      high: "600", 
      urgent: "700"
    };

    const color = baseColors[type as keyof typeof baseColors] || "gray";
    const intensity = intensities[priority as keyof typeof intensities] || "500";
    
    return `bg-${color}-${intensity}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting": return <Users className="h-3 w-3" />;
      case "call": return <Phone className="h-3 w-3" />;
      case "event": return <CalendarIcon className="h-3 w-3" />;
      case "deadline": return <Clock className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime || newEvent.startTime,
      type: newEvent.type,
      priority: newEvent.priority,
      attendees: newEvent.attendees.split(',').map(a => a.trim()).filter(Boolean),
      location: newEvent.location || undefined,
      isVirtual: newEvent.isVirtual,
      meetingLink: newEvent.meetingLink || undefined,
      reminders: newEvent.reminders.split(',').map(r => parseInt(r.trim())).filter(Boolean),
      createdBy: "Current User",
      channel: selectedChannel,
      recurring: newEvent.recurring,
      tags: newEvent.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: "scheduled"
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "meeting",
      priority: "medium",
      attendees: "",
      location: "",
      isVirtual: false,
      meetingLink: "",
      reminders: "15,60",
      recurring: "none",
      tags: ""
    });
    setIsDialogOpen(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesChannel = event.channel === selectedChannel;
    return matchesSearch && matchesType && matchesChannel;
  });

  // View navigation functions
  const previousView = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    } else if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    } else if (view === "day") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
    }
  };

  const nextView = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    } else if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    } else if (view === "day") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
    }
  };

  // Functions for different actions
  const startVideoCall = (event?: CalendarEvent) => {
    if (event?.meetingLink) {
      window.open(event.meetingLink, '_blank');
    } else {
      // Generate a new meeting link
      const meetingId = Math.random().toString(36).substring(2, 15);
      window.open(`https://meet.google.com/${meetingId}`, '_blank');
    }
  };

  const setReminder = (event: CalendarEvent) => {
    const now = new Date();
    const eventTime = new Date(`${event.date} ${event.startTime}`);
    const timeDiff = eventTime.getTime() - now.getTime();
    
    if (timeDiff > 0) {
      setTimeout(() => {
        alert(`Reminder: ${event.title} starts in 15 minutes!`);
      }, Math.max(0, timeDiff - 15 * 60 * 1000)); // 15 minutes before
    }
  };

  const exportCalendar = () => {
    const calendarData = filteredEvents.map(event => ({
      title: event.title,
      start: `${event.date}T${event.startTime}`,
      end: `${event.date}T${event.endTime}`,
      description: event.description,
      location: event.location
    }));
    
    const blob = new Blob([JSON.stringify(calendarData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-${selectedChannel}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const todayEvents = filteredEvents.filter(event => {
    const today = new Date().toISOString().split('T')[0];
    return event.date === today;
  });

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="p-6 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Calendar & Events
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Channel: <span className="font-semibold text-purple-600">#{selectedChannel}</span></span>
              <span>•</span>
              <span>{filteredEvents.length} events</span>
              <span>•</span>
              <span>{todayEvents.length} today</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs value={view} onValueChange={(v) => setView(v as any)} className="ml-4">
              <TabsList className="grid w-48 grid-cols-3">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter event title..."
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="deadline">Deadline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the event..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newEvent.priority} onValueChange={(value: any) => setNewEvent({ ...newEvent, priority: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recurring">Recurring</Label>
                      <Select value={newEvent.recurring} onValueChange={(value: any) => setNewEvent({ ...newEvent, recurring: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="attendees">Attendees (comma separated)</Label>
                    <Input
                      id="attendees"
                      placeholder="John Doe, Jane Smith..."
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Conference Room A or Online"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="meeting, sprint, planning..."
                        value={newEvent.tags}
                        onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addEvent} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-4 gap-6 h-full">
          {/* Calendar View */}
          <div className="col-span-3">
            <Card className="h-full bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                    <span className="text-xl">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={previousView} className="hover:bg-indigo-50">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextView} className="hover:bg-indigo-50">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                {view === "month" && (
                  <>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="p-3 text-center text-sm font-bold text-gray-600 bg-gray-50 rounded-lg">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: firstDayOfMonth }, (_, i) => (
                        <div key={`empty-${i}`} className="h-24" />
                      ))}
                      
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDate(day);
                        const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();
                        
                        return (
                          <div 
                            key={day} 
                            className={`h-24 p-2 border-2 rounded-xl transition-all hover:shadow-md ${
                              isToday 
                                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`text-sm font-bold mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map(event => (
                                <div 
                                  key={event.id} 
                                  className={`text-xs p-1 rounded-md text-white cursor-pointer hover:opacity-80 flex items-center space-x-1 ${getEventTypeColor(event.type, event.priority)}`}
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  {getEventIcon(event.type)}
                                  <span className="truncate">{event.title}</span>
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500 font-medium">+{dayEvents.length - 2} more</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {view === "week" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-8 gap-2">
                      <div className="text-sm font-bold text-gray-600 p-2">Time</div>
                      {Array.from({ length: 7 }, (_, i) => {
                        const weekStart = new Date(currentDate);
                        weekStart.setDate(currentDate.getDate() - currentDate.getDay() + i);
                        const isToday = weekStart.toDateString() === new Date().toDateString();
                        return (
                          <div key={i} className={`text-sm font-bold p-2 text-center rounded-lg ${
                            isToday ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-600'
                          }`}>
                            <div>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</div>
                            <div className="text-xs">{weekStart.getDate()}</div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      {Array.from({ length: 12 }, (_, hour) => {
                        const timeSlot = `${(hour + 8).toString().padStart(2, '0')}:00`;
                        return (
                          <div key={hour} className="grid grid-cols-8 gap-2">
                            <div className="text-xs text-gray-500 p-2">{timeSlot}</div>
                            {Array.from({ length: 7 }, (_, day) => {
                              const cellDate = new Date(currentDate);
                              cellDate.setDate(currentDate.getDate() - currentDate.getDay() + day);
                              const dateStr = cellDate.toISOString().split('T')[0];
                              const cellEvents = filteredEvents.filter(event => 
                                event.date === dateStr && 
                                event.startTime.split(':')[0] === (hour + 8).toString().padStart(2, '0')
                              );
                              
                              return (
                                <div key={day} className="h-12 p-1 border rounded-lg hover:bg-gray-50">
                                  {cellEvents.map(event => (
                                    <div 
                                      key={event.id}
                                      className={`text-xs p-1 rounded cursor-pointer text-white ${getEventTypeColor(event.type, event.priority)}`}
                                      onClick={() => setSelectedEvent(event)}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "day" && (
                  <div className="space-y-4">
                    <div className="text-center text-lg font-semibold text-indigo-600">
                      {currentDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      {Array.from({ length: 16 }, (_, hour) => {
                        const timeSlot = `${(hour + 6).toString().padStart(2, '0')}:00`;
                        const dateStr = currentDate.toISOString().split('T')[0];
                        const timeEvents = filteredEvents.filter(event => 
                          event.date === dateStr && 
                          event.startTime.split(':')[0] === (hour + 6).toString().padStart(2, '0')
                        );
                        
                        return (
                          <div key={hour} className="flex gap-4">
                            <div className="w-16 text-sm text-gray-500 py-2">{timeSlot}</div>
                            <div className="flex-1 min-h-[60px] p-2 border rounded-lg hover:bg-gray-50 space-y-1">
                              {timeEvents.map(event => (
                                <div 
                                  key={event.id}
                                  className={`p-2 rounded-lg cursor-pointer text-white shadow-sm ${getEventTypeColor(event.type, event.priority)}`}
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {getEventIcon(event.type)}
                                      <span className="font-medium">{event.title}</span>
                                    </div>
                                    <span className="text-xs">{event.startTime} - {event.endTime}</span>
                                  </div>
                                  {event.description && (
                                    <p className="text-xs mt-1 opacity-90">{event.description}</p>
                                  )}
                                  {event.attendees.length > 0 && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <Users className="h-3 w-3" />
                                      <span className="text-xs">{event.attendees.slice(0, 3).join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>Today's Events</span>
                  <Badge variant="secondary" className="ml-auto">{todayEvents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {todayEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No events scheduled for today</p>
                ) : (
                  todayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-xl hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{event.title}</h4>
                        <Badge className={`text-xs ${getEventTypeColor(event.type, event.priority)} text-white`}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        {event.attendees.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{event.attendees.slice(0, 2).join(", ")}{event.attendees.length > 2 ? "..." : ""}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                  <span>Upcoming</span>
                  <Badge variant="secondary" className="ml-auto">{upcomingEvents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="p-3 border rounded-xl hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                      <Badge className={`text-xs ${getEventTypeColor(event.type, event.priority)} text-white`}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <Clock className="h-3 w-3" />
                      <span>{event.startTime}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Settings className="h-5 w-5 text-green-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50"
                  onClick={() => startVideoCall()}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-purple-50"
                  onClick={() => selectedEvent && setReminder(selectedEvent)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-orange-50"
                  onClick={exportCalendar}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}