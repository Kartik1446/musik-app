import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

interface MusicVisualizerProps {
  className?: string;
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ className = '' }) => {
  const { isPlaying } = usePlayer();
  
  return (
    <div className={`music-bar ${className} ${isPlaying ? 'opacity-100' : 'opacity-50'}`}>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
      <div className="music-bar-item"></div>
    </div>
  );
};

export default MusicVisualizer;