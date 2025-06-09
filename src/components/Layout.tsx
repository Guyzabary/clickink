import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, MessageSquare, Home, Info, 
  GalleryVertical as Gallery, PenTool, Wand2, LogOut,
  Search as SearchIcon, Upload, Heart, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessageStore } from '../store/messageStore';
import { useAppointmentStore } from '../store/appointmentStore';

const Layout: React.FC = () => {
  const location = useLocation();
  const { userData, signOut, currentUser, loading } = useAuth();
  const { unreadCount: unreadMessages, initializeMessageListener } = useMessageStore();
  const { unreadCount: unreadAppointments, markAppointmentsAsViewed } = useAppointmentStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && currentUser?.uid && userData) {
      const cleanup = initializeMessageListener(currentUser.uid);
      return () => cleanup();
    }
  }, [currentUser?.uid, userData, initializeMessageListener, loading]);

  useEffect(() => {
    if (!loading && location.pathname === '/appointments' && currentUser?.uid) {
      markAppointmentsAsViewed();
    }
  }, [location.pathname, markAppointmentsAsViewed, currentUser?.uid, loading]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery.toLowerCase())}`);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const MessagesNavLink = () => (
    <NavLink 
      to="/messages" 
      icon={
        <div className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </div>
      } 
      text="Messages" 
      onClick={() => setMobileMenuOpen(false)}
    />
  );

  const AppointmentsNavLink = () => (
    <NavLink 
      to="/appointments" 
      icon={
        <div className="relative">
          <Calendar className="h-5 w-5" />
          {unreadAppointments > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadAppointments}
            </span>
          )}
        </div>
      } 
      text="Appointments" 
      onClick={() => setMobileMenuOpen(false)}
    />
  );

  const shouldShowMenuItem = (item: string): boolean => {
    if (!userData) return true;
    
    if (userData.role === 'artist') {
      return true;
    }
    
    if (userData.role === 'client') {
      return !['Upload Work'].includes(item);
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <PenTool className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">ClickInk</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" icon={<Home className="h-5 w-5" />} text="Home" onClick={() => setMobileMenuOpen(false)} />
              <NavLink to="/gallery" icon={<Gallery className="h-5 w-5" />} text="Gallery" onClick={() => setMobileMenuOpen(false)} />
              <NavLink to="/generate" icon={<Wand2 className="h-5 w-5" />} text="AI Generator" onClick={() => setMobileMenuOpen(false)} />

              {userData && !loading && (
                <>
                  {userData.role === 'client' && (
                    <AppointmentsNavLink />
                  )}

                  {userData.role === 'artist' && (
                    <>
                      <NavLink to="/artist-dashboard\" icon={<Upload className="h-5 w-5" />} text="Upload Work" onClick={() => setMobileMenuOpen(false)} />
                      <AppointmentsNavLink />
                    </>
                  )}

                  <MessagesNavLink />
                  {shouldShowMenuItem('Following') && (
                    <NavLink to="/following\" icon={<Heart className="h-5 w-5" />} text="Following" onClick={() => setMobileMenuOpen(false)} />
                  )}
                  <NavLink to="/about" icon={<Info className="h-5 w-5" />} text="About" onClick={() => setMobileMenuOpen(false)} />
                  <NavLink to="/profile" icon={<Users className="h-5 w-5" />} text="My Profile" onClick={() => setMobileMenuOpen(false)} />
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-600 hover:text-purple-600"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {!userData && !loading && (
                <>
                  <NavLink to="/about" icon={<Info className="h-5 w-5" />} text="About" onClick={() => setMobileMenuOpen(false)} />
                  <Link
                    to="/login"
                    className="flex items-center text-gray-600 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5 mr-1" />
                    <span>Login / Register</span>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="space-y-1 px-4 py-3">
              <MobileNavLink to="/" icon={<Home className="h-5 w-5" />} text="Home" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink to="/gallery" icon={<Gallery className="h-5 w-5" />} text="Gallery" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink to="/generate" icon={<Wand2 className="h-5 w-5" />} text="AI Generator" onClick={() => setMobileMenuOpen(false)} />

              {userData && !loading && (
                <>
                  {userData.role === 'client' && (
                    <MobileNavLink to="/appointments\" icon={<Calendar className="h-5 w-5" />} text="Appointments" onClick={() => setMobileMenuOpen(false)} />
                  )}
                  {userData.role === 'artist' && (
                    <>
                      <MobileNavLink to="/artist-dashboard\" icon={<Upload className="h-5 w-5" />} text="Upload Work" onClick={() => setMobileMenuOpen(false)} />
                      <MobileNavLink to="/appointments" icon={<Calendar className="h-5 w-5" />} text="Appointments" onClick={() => setMobileMenuOpen(false)} />
                    </>
                  )}
                  <MobileNavLink 
                    to="/messages" 
                    icon={
                      <div className="relative">
                        <MessageSquare className="h-5 w-5" />
                        {unreadMessages > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                    } 
                    text="Messages" 
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  {shouldShowMenuItem('Following') && (
                    <MobileNavLink to="/following" icon={<Heart className="h-5 w-5" />} text="Following" onClick={() => setMobileMenuOpen(false)} />
                  )}
                  <MobileNavLink to="/about" icon={<Info className="h-5 w-5" />} text="About" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink to="/profile" icon={<Users className="h-5 w-5" />} text="My Profile" onClick={() => setMobileMenuOpen(false)} />
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {!userData && !loading && (
                <>
                  <MobileNavLink to="/about" icon={<Info className="h-5 w-5" />} text="About" onClick={() => setMobileMenuOpen(false)} />
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    <span>Login / Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists by name, studio, city, or style..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <PenTool className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold">ClickInk</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/about" className="hover:text-purple-400">About</Link>
              <Link to="/privacy" className="hover:text-purple-400">Privacy</Link>
              <Link to="/terms" className="hover:text-purple-400">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}> = ({ to, icon, text, onClick }) => (
  <Link
    to={to}
    className="flex items-center text-gray-600 hover:text-purple-600"
    onClick={onClick}
  >
    {icon}
    <span className="ml-1">{text}</span>
  </Link>
);

const MobileNavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}> = ({ to, icon, text, onClick }) => (
  <Link
    to={to}
    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

export default Layout;