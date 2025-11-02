import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { FolderPlusIcon, SunIcon, MoonIcon } from './Icons';
import SettingsModal from './SettingsModal';
import UserProfileModal from './UserProfileModal';

interface NavbarProps {
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSettingsClick, onProfileClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <FolderPlusIcon className="w-8 h-8 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              QualiMed
            </h1>
          </div>

          {/* Right side - Theme Toggle, Settings and Profile */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={handleSettingsClick}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 1.143c.214.2.441.353.684.45.273.119.585-.04.765-.312l.659-.992a1.125 1.125 0 011.831 0l.659.993c.18.271.492.43.765.312.243-.097.47-.25.684-.45l1.296-1.143a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28c.09-.543.56-.94 1.11-.94h2.594c.55 0 1.019.398 1.11.94l.213 1.281c.062.374.312.686.644.87.075.04.146.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.297 1.143c.214.2.44.353.684.45.273.119.585-.04.765-.312l.66-.992a1.125 1.125 0 011.83 0l.66.993c.18.27.492.43.765.31.244-.096.47-.25.684-.45l1.297-1.143a1.125 1.125 0 011.37-.49l1.217.456c.354.133.75.072 1.075-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281zM12 15a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
                      }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.displayName || user?.email || 'User'}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Profile Settings
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-600" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay to close dropdown when clicking outside */}
        {isProfileMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileMenuOpen(false)}
          />
        )}
      </nav>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
