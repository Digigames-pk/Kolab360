import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  Camera,
  Share,
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
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
}

interface CallControls {
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  volume: number;
  isRecording: boolean;
  isScreenSharing: boolean;
}

export function WebRTCVoiceVideoCall({ 
  isOpen, 
  onClose, 
  callType = "voice",
  channelName = "general"
}: {
  isOpen: boolean;
  onClose: () => void;
  callType: "voice" | "video";
  channelName?: string;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [controls, setControls] = useState<CallControls>({
    isMuted: false,
    isVideoOff: callType === "voice",
    isSpeakerOn: true,
    volume: 80,
    isRecording: false,
    isScreenSharing: false
  });

  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "failed">("connecting");
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef(Date.now());

  // Initialize media devices
  const initializeMedia = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === "video" ? { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add local participant
      setParticipants([{
        id: "local",
        name: "You",
        isMuted: controls.isMuted,
        isVideoOff: controls.isVideoOff,
        isSpeaking: false,
        stream
      }]);

      setConnectionStatus("connected");
      setIsConnecting(false);
    } catch (err) {
      console.error("Failed to access media devices:", err);
      setError(err instanceof Error ? err.message : "Failed to access camera/microphone");
      setConnectionStatus("failed");
      setIsConnecting(false);
    }
  }, [callType, controls.isMuted, controls.isVideoOff]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    setLocalStream(null);
    setParticipants([]);
  }, [localStream]);

  // Initialize call when opened
  useEffect(() => {
    if (isOpen) {
      callStartTime.current = Date.now();
      initializeMedia();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen, initializeMedia, cleanup]);

  // Call duration timer
  useEffect(() => {
    if (!isOpen || connectionStatus !== "connected") return;

    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, connectionStatus]);

  // Audio level detection
  useEffect(() => {
    if (!localStream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      setParticipants(prev => prev.map(p => 
        p.id === "local" ? { ...p, isSpeaking: average > 30 && !controls.isMuted } : p
      ));
    };

    const interval = setInterval(checkAudioLevel, 100);
    
    return () => {
      clearInterval(interval);
      audioContext.close();
    };
  }, [localStream, controls.isMuted]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = async () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = controls.isMuted;
      setControls(prev => ({ ...prev, isMuted: !prev.isMuted }));
      setParticipants(prev => prev.map(p => 
        p.id === "local" ? { ...p, isMuted: !controls.isMuted } : p
      ));
    }
  };

  const toggleVideo = async () => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = controls.isVideoOff;
      setControls(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
      setParticipants(prev => prev.map(p => 
        p.id === "local" ? { ...p, isVideoOff: !controls.isVideoOff } : p
      ));
    }
  };

  const toggleSpeaker = () => {
    setControls(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  const endCall = () => {
    cleanup();
    onClose();
  };

  const shareScreen = async () => {
    try {
      if (controls.isScreenSharing) {
        // Stop screen sharing, return to camera
        await initializeMedia();
        setControls(prev => ({ ...prev, isScreenSharing: false }));
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setControls(prev => ({ ...prev, isScreenSharing: true }));
        
        // Listen for screen share end
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          initializeMedia();
          setControls(prev => ({ ...prev, isScreenSharing: false }));
        });
      }
    } catch (err) {
      console.error("Screen sharing failed:", err);
      setError("Screen sharing failed");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-gray-900 text-white border-gray-700" aria-describedby="call-description">
        <DialogTitle className="sr-only">
          {callType === "video" ? "Video Call" : "Voice Call"} - #{channelName}
        </DialogTitle>
        <div id="call-description" className="sr-only">
          {callType} call interface with controls for mute, video, and screen sharing
        </div>
        <div className="flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${
                  connectionStatus === "connected" ? "bg-green-500" : 
                  connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className="font-medium">
                  {callType === "video" ? "Video Call" : "Voice Call"} - #{channelName}
                </span>
              </div>
              
              {connectionStatus === "connected" && (
                <Badge variant="secondary" className="bg-gray-700 text-gray-200">
                  {formatDuration(callDuration)}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-gray-300 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-900/50 border-b border-red-700">
              <p className="text-red-200 text-sm">
                Error: {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={initializeMedia}
                className="mt-2 border-red-500 text-red-200 hover:bg-red-900"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Main Video Area */}
          <div className="flex-1 relative bg-black">
            {isConnecting ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-400">Connecting to {callType} call...</p>
                </div>
              </div>
            ) : connectionStatus === "failed" ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                    <PhoneOff className="h-8 w-8" />
                  </div>
                  <p className="text-gray-400">Call failed to connect</p>
                  <Button onClick={initializeMedia} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative h-full">
                {/* Local Video */}
                {callType === "video" && localStream && (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Audio-only view */}
                {callType === "voice" && (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900 to-purple-900">
                    <div className="text-center space-y-4">
                      <div className={`relative mx-auto ${participants[0]?.isSpeaking ? 'animate-pulse' : ''}`}>
                        <Avatar className="h-32 w-32 border-4 border-white/20">
                          <AvatarFallback className="bg-blue-600 text-white text-4xl">
                            You
                          </AvatarFallback>
                        </Avatar>
                        {participants[0]?.isSpeaking && (
                          <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping" />
                        )}
                      </div>
                      <h3 className="text-2xl font-semibold">Voice Call Active</h3>
                      <p className="text-gray-300">#{channelName}</p>
                    </div>
                  </div>
                )}

                {/* Video disabled overlay */}
                {callType === "video" && controls.isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Avatar className="h-24 w-24 mx-auto">
                        <AvatarFallback className="bg-blue-600 text-white text-2xl">
                          You
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-400">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              {/* Mute Button */}
              <Button
                variant={controls.isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={toggleMute}
                disabled={!localStream}
              >
                {controls.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Video Button */}
              <Button
                variant={controls.isVideoOff ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={toggleVideo}
                disabled={!localStream || callType === "voice"}
              >
                {controls.isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>

              {/* Screen Share Button */}
              {callType === "video" && (
                <Button
                  variant={controls.isScreenSharing ? "default" : "secondary"}
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                  onClick={shareScreen}
                  disabled={!localStream}
                >
                  <Share className="h-5 w-5" />
                </Button>
              )}

              {/* Speaker Button */}
              <Button
                variant={controls.isSpeakerOn ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={toggleSpeaker}
              >
                {controls.isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>

              {/* End Call Button */}
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-12 w-12 p-0 bg-red-600 hover:bg-red-700"
                onClick={endCall}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-center mt-4 space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[controls.volume]}
                  onValueChange={([value]) => setControls(prev => ({ ...prev, volume: value }))}
                  max={100}
                  step={5}
                  className="w-20"
                />
                <span>{controls.volume}%</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}