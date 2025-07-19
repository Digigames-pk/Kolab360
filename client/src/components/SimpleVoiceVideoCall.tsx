import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2,
  VolumeX,
  Settings
} from "lucide-react";

interface CallProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "voice" | "video";
  channelName?: string;
}

export function SimpleVoiceVideoCall({ 
  isOpen, 
  onClose, 
  callType = "voice",
  channelName = "general"
}: CallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "voice");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef(Date.now());

  // Initialize call when opened
  useEffect(() => {
    if (isOpen) {
      initializeCall();
      callStartTime.current = Date.now();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen]);

  // Call duration timer
  useEffect(() => {
    if (!isOpen || !isConnected) return;

    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isConnected]);

  const initializeCall = async () => {
    try {
      setError(null);
      
      if (callType === "video") {
        // Request camera and microphone for video calls
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true
        });
        
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(console.error);
        }
      } else {
        // Request only microphone for voice calls
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        
        setLocalStream(stream);
      }
      
      setIsConnected(true);
    } catch (err) {
      console.error("Failed to initialize call:", err);
      setError("Failed to access camera/microphone. Please check permissions.");
      setIsConnected(false);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsConnected(false);
    setCallDuration(0);
    setError(null);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === "video") {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const endCall = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] p-0 bg-gray-900 text-white border-gray-700"
        aria-describedby="call-interface-description"
      >
        <DialogTitle className="sr-only">
          {callType === "video" ? "Video Call" : "Voice Call"} in #{channelName}
        </DialogTitle>
        
        <div id="call-interface-description" className="sr-only">
          {callType} call interface with mute, video, and end call controls
        </div>

        <div className="flex flex-col h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
              <span className="font-medium">
                {callType === "video" ? "Video Call" : "Voice Call"} - #{channelName}
              </span>
              {isConnected && (
                <Badge variant="secondary" className="bg-gray-700 text-gray-200">
                  {formatDuration(callDuration)}
                </Badge>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/50 text-red-200 text-sm border-b border-red-700">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={initializeCall} 
                className="ml-2 border-red-500 text-red-200"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Main Call Area */}
          <div className="flex-1 relative bg-black">
            {!isConnected ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-400">Connecting...</p>
                </div>
              </div>
            ) : callType === "video" ? (
              <div className="relative h-full">
                {localStream && !isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => {
                      if (localVideoRef.current) {
                        localVideoRef.current.play().catch(console.error);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-800">
                    <div className="text-center space-y-4">
                      <Avatar className="h-24 w-24 mx-auto border-4 border-white/20">
                        <AvatarFallback className="bg-blue-600 text-white text-2xl">
                          You
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-400">Camera is off</p>
                    </div>
                  </div>
                )}
                
                {/* Local video indicator */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/50 text-white">You</Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="text-center space-y-6">
                  <Avatar className="h-32 w-32 mx-auto border-4 border-white/20">
                    <AvatarFallback className="bg-blue-600 text-white text-4xl">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Voice Call Active</h3>
                    <p className="text-gray-300">#{channelName}</p>
                  </div>
                  {isMuted && (
                    <Badge className="bg-red-600 text-white">
                      <MicOff className="h-3 w-3 mr-1" />
                      Muted
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="p-6 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-6">
              {/* Mute Button */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-14 w-14 p-0"
                onClick={toggleMute}
                disabled={!isConnected}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {/* Video Button (only for video calls) */}
              {callType === "video" && (
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full h-14 w-14 p-0"
                  onClick={toggleVideo}
                  disabled={!isConnected}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              )}

              {/* Speaker Button */}
              <Button
                variant={isSpeakerOn ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full h-14 w-14 p-0"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                disabled={!isConnected}
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </Button>

              {/* End Call Button */}
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14 p-0 bg-red-600 hover:bg-red-700"
                onClick={endCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            {/* Call Status */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                {isConnected ? 
                  `${callType === "video" ? "Video" : "Voice"} call in progress` : 
                  "Connecting to call..."
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}