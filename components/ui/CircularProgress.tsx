// components/CircularProgress.tsx
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0–1
  color?: string;
  bg?: string;
  label: string;
}

export default function CircularProgress({
  size = 160,
  strokeWidth = 10,
  progress,
  color = '#000',
  bg = '#e5e5e5',
  label,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={bg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          fill="none"
        />
      </Svg>
      <View style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ fontWeight: '600', fontSize: 16, color: '#000' }}>{label}</Text>
        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>CALORIES REMAINING</Text>
      </View>
    </View>
  );
}