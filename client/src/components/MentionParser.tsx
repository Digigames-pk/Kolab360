import React, { useEffect } from 'react';

interface MentionParserProps {
  text: string;
  onMentionDetected: (mentions: string[]) => void;
}

export function MentionParser({ text, onMentionDetected }: MentionParserProps) {
  useEffect(() => {
    // Parse @mentions from text
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    if (mentions.length > 0) {
      onMentionDetected(mentions);
    }
  }, [text, onMentionDetected]);

  return null; // This is a utility component that doesn't render anything
}

export function parseMentions(text: string): string[] {
  const mentionPattern = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

export function highlightMentions(text: string): React.ReactNode {
  const mentionPattern = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add highlighted mention
    parts.push(
      <span 
        key={match.index}
        className="bg-blue-100 text-blue-800 px-1 rounded font-medium"
      >
        @{match[1]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}