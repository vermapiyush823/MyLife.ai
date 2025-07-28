import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

// Calculator Icon
export const CalculatorIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <Rect x="6" y="4" width="12" height="4" rx="1" fill={color}/>
    <Circle cx="8" cy="12" r="1" fill={color}/>
    <Circle cx="12" cy="12" r="1" fill={color}/>
    <Circle cx="16" cy="12" r="1" fill={color}/>
    <Circle cx="8" cy="16" r="1" fill={color}/>
    <Circle cx="12" cy="16" r="1" fill={color}/>
    <Circle cx="16" cy="16" r="1" fill={color}/>
    <Circle cx="8" cy="20" r="1" fill={color}/>
    <Circle cx="12" cy="20" r="1" fill={color}/>
    <Circle cx="16" cy="20" r="1" fill={color}/>
  </Svg>
);

// Notes Icon
export const NotesIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M16 13H8" stroke={color} strokeWidth="2"/>
    <Path d="M16 17H8" stroke={color} strokeWidth="2"/>
    <Path d="M10 9H8" stroke={color} strokeWidth="2"/>
  </Svg>
);

// Mood Tracker Icon
export const MoodIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M9 9h.01" stroke={color} strokeWidth="2"/>
    <Path d="M15 9h.01" stroke={color} strokeWidth="2"/>
  </Svg>
);

// Vault Icon
export const VaultIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="12" cy="16" r="1" fill={color}/>
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

// Splitwise Icon
export const SplitIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M2 17l10 5 10-5" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M2 12l10 5 10-5" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

// AI Chat Icon
export const AIIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="9" cy="10" r="1" fill={color}/>
    <Circle cx="15" cy="10" r="1" fill={color}/>
    <Path d="M9.5 13a3.5 3.5 0 0 0 5 0" stroke={color} strokeWidth="1.5" fill="none"/>
  </Svg>
);

// Tasks Icon
export const TasksIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 11l3 3L22 4" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

// Calendar Icon
export const CalendarIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M16 2v4" stroke={color} strokeWidth="2"/>
    <Path d="M8 2v4" stroke={color} strokeWidth="2"/>
    <Path d="M3 10h18" stroke={color} strokeWidth="2"/>
  </Svg>
);

// AI Chat Quick Suggestion Icons
export const LightbulbIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21h6" stroke={color} strokeWidth="2"/>
    <Path d="M12 17h.01" stroke={color} strokeWidth="2"/>
    <Path d="M12 3a6 6 0 0 0-6 6c0 1.7.7 3.2 1.8 4.3.3.3.5.7.5 1.1V17h8v-2.6c0-.4.2-.8.5-1.1C17.3 12.2 18 10.7 18 9a6 6 0 0 0-6-6z" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

export const DocumentIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M16 13H8" stroke={color} strokeWidth="2"/>
    <Path d="M16 17H8" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const BrainIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3v1a3 3 0 0 0-3 3 3 3 0 0 0 3 3v1a3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3v-1a3 3 0 0 0 3-3 3 3 0 0 0-3-3V8a3 3 0 0 0-3-3 3 3 0 0 0-3-3z" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

export const SparkleIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

export const ChartIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3v18h18" stroke={color} strokeWidth="2"/>
    <Path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

export const TargetIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

// Navigation Icons
export const BackIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth="2"/>
    <Path d="M12 19l-7-7 7-7" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const DeleteIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18" stroke={color} strokeWidth="2"/>
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M10 11v6" stroke={color} strokeWidth="2"/>
    <Path d="M14 11v6" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const SendIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13" stroke={color} strokeWidth="2"/>
    <Path d="M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

// Status Icons
export const CheckIcon = ({ size = 16, color = '#00D9FF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

export const CrossIcon = ({ size = 16, color = '#FF0080' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={color} strokeWidth="2"/>
    <Path d="M6 6l12 12" stroke={color} strokeWidth="2"/>
  </Svg>
);

// Eye Icons for Password Visibility
export const EyeIcon = ({ size = 20, color = '#888888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
  </Svg>
);

export const EyeOffIcon = ({ size = 20, color = '#888888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M1 1l22 22" stroke={color} strokeWidth="2"/>
  </Svg>
);

// Robot Icon for AI
export const RobotIcon = ({ size = 48, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M12 7v4" stroke={color} strokeWidth="2"/>
    <Circle cx="8" cy="16" r="1" fill={color}/>
    <Circle cx="16" cy="16" r="1" fill={color}/>
    <Path d="M9 18h6" stroke={color} strokeWidth="2"/>
  </Svg>
);
