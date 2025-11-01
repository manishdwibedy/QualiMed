import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { XIcon, UserIcon } from './Icons';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
                  }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                {user?.displayName || 'User'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 font-medium text-sm text-center transition-colors ${
              activeTab === 'profile'
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-4 py-3 font-medium text-sm text-center transition-colors ${
              activeTab === 'security'
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Security
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.displayName || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account Created
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Authentication Method
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.providerData?.[0]?.providerId === 'google.com'
                    ? 'Google Account'
                    : user?.providerData?.[0]?.providerId === 'password'
                    ? 'Email/Password'
                    : 'Unknown'
                  }
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last Sign In
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.metadata?.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleString()
                    : 'Unknown'
                  }
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                <button className="w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
