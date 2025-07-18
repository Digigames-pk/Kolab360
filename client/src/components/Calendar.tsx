import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Video } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "meeting" | "call" | "event" | "deadline";
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
}

const typeConfig = {
  meeting: { label: "Meeting", color: "bg-blue-500", icon: Users },
  call: { label: "Call", color: "bg-green-500", icon: Video },
  event: { label: "Event", color: "bg-purple-500", icon: CalendarIcon },
  deadline: { label: "Deadline", color: "bg-red-500", icon: Clock }
};

export function Calendar({ channelId }: { channelId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Weekly Team Standup",
      description: "Review progress and plan upcoming tasks",
      date: "2025-01-20",
      startTime: "09:00",
      endTime: "10:00",
      type: "meeting",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Bob Wilson"],
      isRecurring: true
    },
    {
      id: "2",
      title: "Product Demo",
      date: "2025-01-22",
      startTime: "14:00",
      endTime: "15:30",
      type: "call",
      location: "Zoom Meeting"
    },
    {
      id: "3",
      title: "Project Deadline",
      description: "Final submission for Q1 deliverables",
      date: "2025-01-25",
      startTime: "17:00",
      endTime: "17:00",
      type: "deadline"
    }
  ]);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "meeting" as const,
    location: "",
    attendees: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addMeeting = () => {
    if (newMeeting.title.trim() && newMeeting.date && newMeeting.startTime) {
      const meeting: Meeting = {
        id: Date.now().toString(),
        title: newMeeting.title,
        description: newMeeting.description || undefined,
        date: newMeeting.date,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime || newMeeting.startTime,
        type: newMeeting.type,
        location: newMeeting.location || undefined,
        attendees: newMeeting.attendees ? newMeeting.attendees.split(',').map(a => a.trim()) : undefined
      };
      setMeetings([...meetings, meeting]);
      setNewMeeting({ title: "", description: "", date: "", startTime: "", endTime: "", type: "meeting", location: "", attendees: "" });
      setIsDialogOpen(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(meeting => meeting.date === dateStr);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
    const TypeIcon = typeConfig[meeting.type].icon;
    
    return (
      <div className={`text-xs p-2 rounded border-l-2 ${typeConfig[meeting.type].color} bg-background/50 backdrop-blur-sm`}>
        <div className="flex items-center space-x-1 mb-1">
          <TypeIcon className="h-3 w-3" />
          <span className="font-medium truncate">{meeting.title}</span>
        </div>
        <div className="text-muted-foreground">
          {formatTime(meeting.startTime)}
          {meeting.endTime !== meeting.startTime && ` - ${formatTime(meeting.endTime)}`}
        </div>
        {meeting.location && (
          <div className="flex items-center space-x-1 mt-1">
            <MapPin className="h-2 w-2" />
            <span className="truncate">{meeting.location}</span>
          </div>
        )}
      </div>
    );
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-lg">Calendar</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-border">
            {(['month', 'week', 'day'] as const).map((viewOption) => (
              <Button
                key={viewOption}
                variant={view === viewOption ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 rounded-none first:rounded-l-md last:rounded-r-md"
                onClick={() => setView(viewOption)}
              >
                {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
              </Button>
            ))}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newMeeting.type} onValueChange={(value: any) => setNewMeeting({ ...newMeeting, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="time"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="time"
                      value={newMeeting.endTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                    placeholder="Meeting room, Zoom link, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attendees</label>
                  <Input
                    value={newMeeting.attendees}
                    onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
                    placeholder="Comma-separated names"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={addMeeting} className="flex-1">
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 p-4">
        {view === 'month' && (
          <div className="h-full">
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px h-[calc(100%-40px)]">
              {days.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth;
                const isToday = day.toDateString() === today.toDateString();
                const dayMeetings = getMeetingsForDate(day);
                
                return (
                  <div
                    key={index}
                    className={`border border-border p-2 min-h-[120px] ${
                      isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className={`text-sm mb-2 ${
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    } ${isToday ? 'font-semibold' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 3).map(meeting => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                      ))}
                      {dayMeetings.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayMeetings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}