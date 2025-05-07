import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './navigation/Sidebar';
import MusicPlayer from './player/MusicPlayer';
import MobileNav from './navigation/MobileNav';
import { usePlayer } from '../contexts/PlayerContext';

const Layout: React.FC = () => {
  const { currentSong } = usePlayer();
  
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-white">
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