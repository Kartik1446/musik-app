import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ListMusic, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-dark-900 border-t border-dark-700">
      <nav className="flex justify-around items-center h-14">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center px-3 py-2 ${
            location.pathname === '/' ? 'text-secondary-500' : 'text-dark-400'
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          to="/search"
          className={`flex flex-col items-center justify-center px-3 py-2 ${
            location.pathname === '/search' ? 'text-secondary-500' : 'text-dark-400'
          }`}
        >
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        {currentUser && (
          <>
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center px-3 py-2 ${
                location.pathname.startsWith('/playlist') ? 'text-secondary-500' : 'text-dark-400'
              }`}
            >
              <ListMusic size={20} />
              <span className="text-xs mt-1">Library</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center px-3 py-2 ${
                location.pathname === '/profile' ? 'text-secondary-500' : 'text-dark-400'
              }`}
            >
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </>
        )}
        
        {!currentUser && (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center px-3 py-2 ${
              location.pathname === '/login' ? 'text-secondary-500' : 'text-dark-400'
            }`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Sign In</span>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default MobileNav