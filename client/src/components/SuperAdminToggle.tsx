import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SuperAdminToggleProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function SuperAdminToggle({ currentRole, onRoleChange }: SuperAdminToggleProps) {
  // Hidden toggle for testing - only visible in development
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-gray-600">Dev Mode:</span>
        <Button
          variant={currentRole === 'admin' ? 'default' : 'outline'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onRoleChange('admin')}
        >
          <User className="h-3 w-3 mr-1" />
          User
        </Button>
        <Button
          variant={currentRole === 'super_admin' ? 'default' : 'outline'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onRoleChange('super_admin')}
        >
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Button>
        {currentRole === 'super_admin' && (
          <Badge variant="destructive" className="text-xs">DEBUG</Badge>
        )}
      </div>
    </div>
  );
}