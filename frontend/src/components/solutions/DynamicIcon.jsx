import React from 'react';
import * as Icons from 'lucide-react';

export default function DynamicIcon({ name, size = 18, className = '', color = 'currentColor', strokeWidth = 2 }) {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent size={size} className={className} color={color} strokeWidth={strokeWidth} />;
}
