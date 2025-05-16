import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './navigation/Sidebar';
import MusicPlayer from './player/MusicPlayer';
import MobileNav from './navigation/MobileNav';
import { usePlayer } from '../contexts/PlayerContext';

const Layout: React.FC = () => {
  const { currentSong } = usePlayer();

  useEffect(() => {
    // Initialize FinisherHeader after component mounts
    if (window.FinisherHeader) {
      new window.FinisherHeader({
        "count": 10,
        "size": {
          "min": 1128,
          "max": 1500,
          "pulse": 0
        },
        "speed": {
          "x": {
            "min": 0.1,
            "max": 0.6
          },
          "y": {
            "min": 0.1,
            "max": 0.6
          }
        },
        "colors": {
          "background": "#270c41",
          "particles": [
            "#ff4848",
            "#000000",
            "#0c113f",
            "#000000",
            "#ff0000"
          ]
        },
        "blending": "overlay",
        "opacity": {
          "center": 0.5,
          "edge": 0.05
        },
        "skew": -2.7,
        "shapes": [
          "c"
        ]
      });
    }
  }, []);
  
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-white">
      {/* Animated Header */}
      <div className="finisher-header fixed top-0 left-0 right-0" style={{ width: '100%', height: '300px', zIndex: -1 }}></div>
      
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block w-64 h-full">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-32">
          <Outlet />
        </main>
        
        {/* Music player - fixed at bottom */}
        <div className={`fixed bottom-0 left-0 right-0 z-20 transition-all duration-500 ${currentSong ? 'translate-y-0' : 'translate-y-full'}`}>
          <MusicPlayer />
        </div>
        
        {/* Mobile navigation - visible only on mobile */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
};

export default Layout;