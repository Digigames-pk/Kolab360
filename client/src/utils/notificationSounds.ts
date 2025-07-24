// Notification sound system with user availability status support

export type UserStatus = 'available' | 'busy' | 'away' | 'do_not_disturb';

interface NotificationPreferences {
  soundEnabled: boolean;
  status: UserStatus;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

class NotificationSoundManager {
  private preferences: NotificationPreferences;
  private audioContext: AudioContext | null = null;
  
  constructor() {
    // Load user preferences from localStorage
    this.preferences = this.loadPreferences();
    
    // Initialize audio context on user interaction
    this.initializeAudioContext();
  }
  
  private loadPreferences(): NotificationPreferences {
    const saved = localStorage.getItem('notification-preferences');
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      status: 'available',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }
  
  private savePreferences(): void {
    localStorage.setItem('notification-preferences', JSON.stringify(this.preferences));
  }
  
  private initializeAudioContext(): void {
    // Initialize on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    }, { once: true });
  }
  
  private shouldPlaySound(): boolean {
    // Don't play if sounds are disabled
    if (!this.preferences.soundEnabled) return false;
    
    // Don't play if user is busy or do not disturb
    if (this.preferences.status === 'busy' || this.preferences.status === 'do_not_disturb') {
      return false;
    }
    
    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = this.preferences.quietHours;
      
      // Handle quiet hours that span midnight
      if (start > end) {
        if (currentTime >= start || currentTime <= end) {
          return false;
        }
      } else {
        if (currentTime >= start && currentTime <= end) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  private async createTone(frequency: number, duration: number, volume: number = 0.3): Promise<void> {
    if (!this.audioContext || !this.shouldPlaySound()) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }
  
  // Play gentle notification sound for regular messages
  async playMessageSound(): Promise<void> {
    if (!this.shouldPlaySound()) return;
    
    console.log('🔊 Playing message notification sound');
    
    // Gentle two-tone notification
    await this.createTone(800, 0.15, 0.2);
    setTimeout(() => this.createTone(600, 0.15, 0.2), 100);
  }
  
  // Play attention-grabbing sound for @mentions
  async playMentionSound(): Promise<void> {
    if (!this.shouldPlaySound()) return;
    
    console.log('🔊 Playing mention notification sound');
    
    // More prominent three-tone notification
    await this.createTone(1000, 0.2, 0.3);
    setTimeout(() => this.createTone(800, 0.2, 0.3), 150);
    setTimeout(() => this.createTone(1000, 0.3, 0.3), 300);
  }
  
  // Update user status
  setUserStatus(status: UserStatus): void {
    this.preferences.status = status;
    this.savePreferences();
    console.log(`🔧 User status updated to: ${status}`);
  }
  
  // Toggle sound notifications
  setSoundEnabled(enabled: boolean): void {
    this.preferences.soundEnabled = enabled;
    this.savePreferences();
    console.log(`🔧 Sound notifications ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Configure quiet hours
  setQuietHours(enabled: boolean, start?: string, end?: string): void {
    this.preferences.quietHours.enabled = enabled;
    if (start) this.preferences.quietHours.start = start;
    if (end) this.preferences.quietHours.end = end;
    this.savePreferences();
    console.log(`🔧 Quiet hours ${enabled ? 'enabled' : 'disabled'}`, { start, end });
  }
  
  // Get current preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }
}

// Export singleton instance
export const notificationSounds = new NotificationSoundManager();