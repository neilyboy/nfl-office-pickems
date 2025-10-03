import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  avatarType?: string;
  avatarValue?: string | null;
  avatarColor: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const FONT_SIZES = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '24px',
};

const EMOJI_SIZES = {
  sm: '20px',
  md: '24px',
  lg: '28px',
  xl: '36px',
};

export function UserAvatar({
  firstName,
  lastName,
  avatarType = 'initials',
  avatarValue,
  avatarColor,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const isEmoji = avatarType === 'emoji' && avatarValue;
  const backgroundColor = isEmoji ? '#1e293b' : avatarColor;
  const fontSize = isEmoji ? EMOJI_SIZES[size] : FONT_SIZES[size];
  
  return (
    <Avatar className={`${SIZE_CLASSES[size]} ${className}`} style={{ backgroundColor }}>
      <AvatarFallback 
        style={{ 
          backgroundColor, 
          color: 'white', 
          fontSize 
        }}
      >
        {isEmoji ? avatarValue : getInitials(firstName, lastName)}
      </AvatarFallback>
    </Avatar>
  );
}
