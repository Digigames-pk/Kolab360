import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  VolumeX, 
  Volume2,
  Settings,
  Users,
  MessageSquare,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  MonitorSpeaker,
  Headphones,
  Camera,
  Share,
  Record,
  Grid3X3,
  Sidebar,
  Hand,
  Copy,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  connectionStatus: "connected" | "connecting" | "disconnected";
}

interface CallControls {
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  volume: number;
  isRecording: boolean;
  isScreenSharing: boolean;
}

export function VoiceVideoCall({ 
  isOpen, 
  onClose, 
  callType = "voice",
  initialParticipants = []
}: {
  isOpen: boolean;
  onClose: () => void;
  callType: "voice" | "video";
  initialParticipants?: any[];
}) {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "You",
      isMuted: false,
      isVideoOff: callType === "voice",
      isSpeaking: false,
      connectionStatus: "connected"
    },
    ...initialParticipants.map((p, index) => ({
      id: `participant-${index + 2}`,
      name: p.name || `Participant ${index + 2}`,
      isMuted: false,
      isVideoOff: callType === "voice",
      isSpeaking: Math.random() > 0.7,
      connectionStatus: "connected" as const
    }))
  ]);

  const [controls, setControls] = useState<CallControls>({
    isMuted: false,
    isVideoOff: callType === "voice",
    isSpeakerOn: true,
    volume: 80,
    isRecording: false,
    isScreenSharing: false
  });

  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("good");

  const callStartTime = useRef(Date.now());

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    // Simulate speaking animation
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSpeaking: p.id === "1" ? false : Math.random() > 0.8
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setControls(prev => ({ ...prev, isMuted: !prev.isMuted }));
    setParticipants(prev => prev.map(p => 
      p.id === "1" ? { ...p, isMuted: !controls.isMuted } : p
    ));
  };

  const toggleVideo = () => {
    setControls(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
    setParticipants(prev => prev.map(p => 
      p.id === "1" ? { ...p, isVideoOff: !controls.isVideoOff } : p
    ));
  };

  const toggleSpeaker = () => {
    setControls(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  const toggleRecording = () => {
    setControls(prev => ({ ...prev, isRecording: !prev.isRecording }));
  };

  const toggleScreenShare = () => {
    setControls(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  };

  const endCall = () => {
    onClose();
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case "excellent": return "text-green-500";
      case "good": return "text-yellow-500";
      case "poor": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const ParticipantVideo = ({ participant, isMainSpeaker = false }: { participant: Participant; isMainSpeaker?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative ${
        isMainSpeaker 
          ? "col-span-2 row-span-2" 
          : viewMode === "grid" 
            ? "aspect-video" 
            : "aspect-square"
      } bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border-2 ${
        participant.isSpeaking ? "border-green-400 shadow-lg shadow-green-400/20" : "border-slate-600"
      }`}
    >
      {/* Video/Avatar Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {participant.isVideoOff ? (
          <div className="flex flex-col items-center space-y-3">
            <Avatar className={`${isMainSpeaker ? "h-24 w-24" : "h-16 w-16"} ring-2 ring-white/20`}>
              <AvatarFallback className="text-2xl font-semibold">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className={`text-white font-medium ${isMainSpeaker ? "text-lg" : "text-sm"}`}>
              {participant.name}
            </span>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <Camera className="h-8 w-8 text-white/50" />
          </div>
        )}
      </div>

      {/* Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium">{participant.name}</span>
            {participant.isSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {participant.isMuted && (
              <div className="bg-red-500 rounded-full p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
            
            <div className={`w-2 h-2 rounded-full ${
              participant.connectionStatus === "connected" ? "bg-green-400" : 
              participant.connectionStatus === "connecting" ? "bg-yellow-400" : "bg-red-400"
            }`} />
          </div>
        </div>
      </div>

      {/* Screen Share Indicator */}
      {controls.isScreenSharing && participant.id === "1" && (
        <div className="absolute top-3 left-3">
          <Badge className="bg-blue-500 text-white">
            <Share className="h-3 w-3 mr-1" />
            Sharing
          </Badge>
        </div>
      )}
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "max-w-none w-screen h-screen" 
            : "max-w-6xl h-[80vh]"
        } p-0 bg-slate-900 border-slate-700 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionQualityColor()}`} />
              <span className="text-white font-medium">
                {callType === "video" ? "Video Call" : "Voice Call"}
              </span>
            </div>
            
            <div className="text-slate-400 text-sm">
              {formatDuration(callDuration)}
            </div>

            {controls.isRecording && (
              <Badge className="bg-red-500 text-white animate-pulse">
                <Record className="h-3 w-3 mr-1" />
                Recording
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-4 w-4" />
              <span className="ml-1">{participants.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            {callType === "video" ? (
              <div className={`h-full ${
                viewMode === "grid" 
                  ? `grid gap-4 ${
                      participants.length <= 2 ? "grid-cols-2" :
                      participants.length <= 4 ? "grid-cols-2 grid-rows-2" :
                      participants.length <= 6 ? "grid-cols-3 grid-rows-2" :
                      "grid-cols-4 grid-rows-2"
                    }`
                  : "grid grid-cols-1 gap-4"
              }`}>
                <AnimatePresence>
                  {participants.map((participant) => (
                    <ParticipantVideo 
                      key={participant.id} 
                      participant={participant}
                      isMainSpeaker={viewMode === "speaker" && participant.isSpeaking}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              // Voice Call Layout
              <div className="h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
                  {participants.map((participant) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center space-y-3"
                    >
                      <div className={`relative ${participant.isSpeaking ? "animate-pulse" : ""}`}>
                        <Avatar className="h-20 w-20 ring-4 ring-white/20">
                          <AvatarFallback className="text-2xl font-semibold">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        {participant.isSpeaking && (
                          <motion.div
                            className="absolute -inset-2 rounded-full border-2 border-green-400"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}

                        {participant.isMuted && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                            <MicOff className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-white font-medium">{participant.name}</div>
                        <div className={`text-xs ${
                          participant.connectionStatus === "connected" ? "text-green-400" : 
                          participant.connectionStatus === "connecting" ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {participant.connectionStatus}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {(showParticipants || showChat) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-800 border-l border-slate-700"
            >
              {showParticipants && (
                <div className="p-4">
                  <h3 className="text-white font-medium mb-4">Participants ({participants.length})</h3>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-700">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{participant.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                          {participant.isVideoOff && <VideoOff className="h-3 w-3 text-gray-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-slate-800 border-t border-slate-700 p-4">
          <div className="flex items-center justify-center space-x-4">
            {/* Mute Toggle */}
            <Button
              variant={controls.isMuted ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={toggleMute}
            >
              {controls.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Video Toggle */}
            {callType === "video" && (
              <Button
                variant={controls.isVideoOff ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={toggleVideo}
              >
                {controls.isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            )}

            {/* Speaker Toggle */}
            <Button
              variant={controls.isSpeakerOn ? "secondary" : "outline"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={toggleSpeaker}
            >
              {controls.isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            {/* Screen Share */}
            <Button
              variant={controls.isScreenSharing ? "default" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={toggleScreenShare}
            >
              <Share className="h-5 w-5" />
            </Button>

            {/* Record */}
            <Button
              variant={controls.isRecording ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={toggleRecording}
            >
              <Record className="h-5 w-5" />
            </Button>

            {/* More Options */}
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full h-12 w-12 p-0"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-12 w-12 p-0 bg-red-500 hover:bg-red-600"
              onClick={endCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <VolumeX className="h-4 w-4 text-slate-400" />
            <Slider
              value={[controls.volume]}
              onValueChange={(value) => setControls(prev => ({ ...prev, volume: value[0] }))}
              max={100}
              step={1}
              className="w-32"
            />
            <Volume2 className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 text-sm w-8">{controls.volume}%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}