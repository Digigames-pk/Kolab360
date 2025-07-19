import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ModernSlackSidebar } from '@/components/ModernSlackSidebar';
import { ModernTopBar } from '@/components/ModernTopBar';
import { RealTimeChat } from '@/components/RealTimeChat';
import { RobustTaskBoard } from '@/components/RobustTaskBoard';
import { EnhancedCalendar } from '@/components/EnhancedCalendar';
import { WasabiFileUpload } from '@/components/WasabiFileUpload';
import { DocumentManager } from '@/components/DocumentManager';
import { AIAssistant } from '@/components/AIAssistant';
import { EnhancedSearch } from '@/components/EnhancedSearch';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { IntegrationHub } from '@/components/IntegrationHub';
import NotificationCenter from '@/components/NotificationCenter';
import EmailTestCenter from '@/components/EmailTestCenter';
import PinningSystem, { PinButton } from '@/components/PinningSystem';
import { WorkspaceThemeCustomizer } from '@/components/WorkspaceThemeCustomizer';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { FileViewer } from '@/components/FileViewer';
import { SimpleVoiceVideoCall } from '@/components/SimpleVoiceVideoCall';
import { InteractiveOnboarding } from '@/components/InteractiveOnboarding';
import { GamificationSystem } from '@/components/GamificationSystem';
import { EnterpriseAdminPanel } from '@/components/EnterpriseAdminPanel';
import { ProfileModal } from '@/components/ProfileModal';
import { InviteUsersModal } from '@/components/InviteUsersModal';
import { ChannelInfoModal } from '@/components/ChannelInfoModal';
import { MessageSquare, Bell, Star, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DebugLogger, logger } from '@/components/DebugLogger';
import { SystemTester } from '@/components/SystemTester';

export default function Home() {
  const [location, setLocation] = useLocation();
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'tasks' | 'calendar' | 'files' | 'documents' | 'ai' | 'search' | 'integrations' | 'threads' | 'mentions' | 'saved' | 'people' | 'test'>('chat');
  const [selectedWorkspace, setSelectedWorkspace] = useState(1);
  const [currentTheme, setCurrentTheme] = useState('slack-light');

  // Component mount logging
  useEffect(() => {
    logger.log('info', 'Home', 'Component mounted', { 
      selectedChannel, 
      activeView, 
      selectedWorkspace 
    });
  }, []);

  // View change logging
  useEffect(() => {
    logger.log('info', 'Home', 'View changed', { activeView, selectedChannel });
  }, [activeView, selectedChannel]);
  
  // Modal states
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showEnterprisePanel, setShowEnterprisePanel] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInviteUsers, setShowInviteUsers] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  
  // Selected items for modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  // Mock user data
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin' as const
  };

  // Mock workspace data
  const workspaces = [
    { id: 1, name: 'Kolab360 Demo', initial: 'KD' },
    { id: 2, name: 'Marketing Team', initial: 'MT' },
    { id: 3, name: 'Development', initial: 'DV' }
  ];

  // Mock workspace data with channels and DMs
  const workspaceData = {
    1: {
      channels: [
        { name: 'general', unread: 3, type: 'public', description: 'General discussion' },
        { name: 'random', unread: 0, type: 'public', description: 'Random conversations' },
        { name: 'announcements', unread: 1, type: 'public', description: 'Important announcements' },
        { name: 'dev-team', unread: 0, type: 'private', description: 'Development team discussions' }
      ],
      directMessages: [
        { name: 'Sarah Wilson', status: 'online', unread: 2, lastMessage: 'Thanks for the update!', id: 'sarah-wilson' },
        { name: 'Mike Johnson', status: 'away', unread: 0, lastMessage: 'Let\'s sync up tomorrow', id: 'mike-johnson' },
        { name: 'Lisa Chen', status: 'offline', unread: 1, lastMessage: 'Great work on the project', id: 'lisa-chen' }
      ]
    },
    2: {
      channels: [
        { name: 'general', unread: 0, type: 'public', description: 'Marketing team chat' },
        { name: 'campaigns', unread: 2, type: 'public', description: 'Campaign discussions' }
      ],
      directMessages: [
        { name: 'Marketing Lead', status: 'online', unread: 0, lastMessage: 'Campaign looks great!', id: 'marketing-lead' }
      ]
    },
    3: {
      channels: [
        { name: 'general', unread: 1, type: 'public', description: 'Development team' },
        { name: 'code-review', unread: 0, type: 'public', description: 'Code reviews' }
      ],
      directMessages: [
        { name: 'Dev Lead', status: 'online', unread: 0, lastMessage: 'Code review needed', id: 'dev-lead' }
      ]
    }
  };

  // Get current workspace data
  const currentWorkspaceData = workspaceData[selectedWorkspace] || workspaceData[1];
  const channels = currentWorkspaceData.channels;
  const directMessages = currentWorkspaceData.directMessages;

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Modern Slack-style Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-hidden">
        <ModernSlackSidebar
          selectedChannel={selectedChannel}
          onChannelSelect={(channel) => {
            setSelectedChannel(channel);
            setActiveView('chat');
            setSelectedDM(null);
          }}
          onViewChange={setActiveView}
          currentView={activeView}
          onShowThemeCustomizer={() => setShowThemeCustomizer(true)}
          onShowSearch={() => setShowSearch(true)}
          onShowNotifications={() => setShowNotifications(true)}
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onWorkspaceSelect={setSelectedWorkspace}
          onShowProfile={() => setShowProfile(true)}
          onStartCall={(type) => {
            setCallType(type);
            setShowVoiceCall(true);
          }}
          onShowSettings={() => alert('Opening audio settings...')}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Modern Top Bar */}
        <ModernTopBar
          selectedChannel={selectedChannel}
          currentView={activeView}
          onShowSearch={() => setShowSearch(true)}
          onShowNotifications={() => setShowNotifications(true)}
          onViewChange={setActiveView}
          onStartCall={(type) => {
            setCallType(type);
            setShowVoiceCall(true);
          }}
          onInviteUsers={() => setShowInviteUsers(true)}
          onShowChannelInfo={() => setShowChannelInfo(true)}
          onShowSettings={() => alert('Opening channel settings...')}
        />

        {/* Content Area */}
        <div className="flex-1 bg-white overflow-y-auto w-full">
          {activeView === "chat" && (
            <RealTimeChat
              channelId={selectedDM ? undefined : selectedChannel}
              recipientId={selectedDM ? directMessages.find(dm => dm.name === selectedDM)?.id : undefined}
              recipientName={selectedDM}
            />
          )}

          {activeView === "tasks" && (
            <div className="min-h-full flex flex-col">
              <div className="p-6 border-b bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Tasks - #{selectedChannel}</h2>
                    <p className="text-gray-600">Manage tasks and project progress for this channel</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Channel: {selectedChannel}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 min-h-0 w-full">
                <RobustTaskBoard 
                  selectedChannel={selectedChannel === 'general' ? '550e8400-e29b-41d4-a716-446655440000' : selectedChannel}
                  workspaceId={selectedWorkspace}
                />
              </div>
            </div>
          )}

          {activeView === "calendar" && (
            <div className="min-h-full flex flex-col">
              <div className="p-6 border-b bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Calendar - #{selectedChannel}</h2>
                    <p className="text-gray-600">Schedule and track events for this channel</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Channel: {selectedChannel}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto w-full">
                <EnhancedCalendar selectedChannel={selectedChannel} />
              </div>
            </div>
          )}

          {activeView === "files" && (
            <div className="min-h-full flex flex-col">
              <div className="p-6 border-b bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Files & Storage - #{selectedChannel}</h2>
                    <p className="text-gray-600">Upload, manage, and share files for this channel</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Channel: {selectedChannel}
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto w-full">
                <WasabiFileUpload
                  onFileUpload={(files) => {
                    console.log('Files uploaded:', files);
                  }}
                  maxFiles={10}
                  maxSizeMB={100}
                  allowedTypes={['image/*', 'application/pdf', 'text/*', 'application/*']}
                  workspaceId={selectedWorkspace.toString()}
                  channelId={selectedChannel}
                />
              </div>
            </div>
          )}

          {activeView === "documents" && (
            <div className="h-full w-full">
              <DocumentManager 
                channelId={selectedChannel}
                workspaceId={selectedWorkspace.toString()}
              />
            </div>
          )}

          {activeView === "ai" && (
            <div className="h-full w-full">
              <AIAssistant
                channelId={selectedChannel}
                workspaceId={selectedWorkspace.toString()}
              />
            </div>
          )}

          {activeView === "search" && (
            <div className="min-h-full flex flex-col">
              <div className="p-6 border-b bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Search Results</h2>
                    <p className="text-gray-600">Find messages, files, and content across channels</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto w-full">
                <EnhancedSearch />
              </div>
            </div>
          )}

          {activeView === "test" && (
            <div className="h-full w-full p-6">
              <SystemTester 
                onViewChange={setActiveView}
                activeView={activeView}
              />
            </div>
          )}

          {activeView === "integrations" && (
            <div className="p-6 overflow-y-auto w-full">
              <IntegrationHub 
                onIntegrationToggle={(integrationId, isConnected) => {
                  console.log(`Integration ${integrationId} ${isConnected ? 'connected' : 'disconnected'}`);
                }}
              />
            </div>
          )}

          {(activeView === "threads" || activeView === "mentions" || activeView === "saved" || activeView === "people") && (
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  {activeView === "threads" && <MessageSquare className="h-8 w-8 text-gray-500" />}
                  {activeView === "mentions" && <Bell className="h-8 w-8 text-gray-500" />}
                  {activeView === "saved" && <Star className="h-8 w-8 text-gray-500" />}
                  {activeView === "people" && <Users className="h-8 w-8 text-gray-500" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold capitalize">{activeView}</h3>
                  <p className="text-gray-500">Feature coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals and Dialogs */}
      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Advanced Search</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AdvancedSearch />
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Notifications</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <NotificationCenter />
            </div>
          </div>
        </div>
      )}

      {/* Theme Customizer Modal */}
      {showThemeCustomizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden relative">
            <button
              onClick={() => setShowThemeCustomizer(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white dark:bg-gray-800 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>
            <WorkspaceThemeCustomizer
              workspaceId={selectedWorkspace}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onUpdate={(updatedTask) => {
          console.log('Task updated:', updatedTask);
        }}
      />

      {/* File Viewer Modal */}
      <FileViewer
        file={selectedFile}
        isOpen={showFileModal}
        onClose={() => {
          setShowFileModal(false);
          setSelectedFile(null);
        }}
      />

      {/* Voice/Video Call Modal */}
      <SimpleVoiceVideoCall
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        callType={callType}
        channelName={selectedChannel}
      />

      {/* Interactive Onboarding */}
      <InteractiveOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />

      {/* Gamification System */}
      <GamificationSystem
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
      />

      {/* Enterprise Admin Panel */}
      {user.role === 'super_admin' && (
        <EnterpriseAdminPanel
          isOpen={showEnterprisePanel}
          onClose={() => setShowEnterprisePanel(false)}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Invite Users Modal */}
      <InviteUsersModal
        isOpen={showInviteUsers}
        onClose={() => setShowInviteUsers(false)}
        channelName={selectedChannel}
      />

      {/* Channel Info Modal */}
      <ChannelInfoModal
        isOpen={showChannelInfo}
        onClose={() => setShowChannelInfo(false)}
        channelName={selectedChannel}
      />

      {/* Debug Logger */}
      <DebugLogger />
    </div>
  );
}