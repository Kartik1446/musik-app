import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign in:', error);
      toast.error('Failed to sign in with Google');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 flex flex-col justify-center items-center px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-secondary-600 rounded-full flex items-center justify-center mb-4">
          <Music size={44} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Harmony</h1>
        <p className="text-dark-300 text-center max-w-md">
          Your personal music experience powered by YouTube with playlists, lyrics, and more.
        </p>
      </div>
      
      <div className="bg-dark-800 p-8 rounded-xl w-full max-w-md shadow-xl border border-dark-700">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>
        
        <button
          onClick={handleSignIn}
          className="btn w-full bg-white hover:bg-gray-100 text-dark-900 font-medium flex items-center justify-center py-3 space-x-3"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          <span>Sign in with Google</span>
        </button>
        
        <div className="mt-8 text-center text-sm text-dark-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
      
      <div className="mt-10 flex space-x-8 text-dark-400 text-sm">
        <a href="#" className="hover:text-white">Privacy Policy</a>
        <a href="#" className="hover:text-white">Terms of Service</a>
        <a href="#" className="hover:text-white">Contact</a>
      </div>
    </div>
  );
};

export default LoginPage;