import React, { useState } from 'react';
import { User, StoredUser } from '../types';
import { useLanguage } from '../languageContext';
import { XIcon } from './icons';
import UserProfileModal from './modals/UserProfileModal';

interface UserManagementProps {
  users: StoredUser[];
  currentUser: User;
  onUpdateUser: (user: StoredUser) => void;
  onDeleteUser: (userId: string) => void;
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onUpdateUser, onDeleteUser, onClose }) => {
  const { t } = useLanguage();
  const [viewingProfile, setViewingProfile] = useState<StoredUser | null>(null);

  const handleToggleStatus = (user: StoredUser) => {
    const confirmMessage = user.isActive ? t('confirmDeactivateUser') : t('confirmActivateUser');
    if (window.confirm(confirmMessage)) {
      onUpdateUser({ ...user, isActive: !user.isActive });
    }
  };

  const handlePromote = (user: StoredUser) => {
    if (window.confirm(t('confirmPromoteUser'))) {
        onUpdateUser({ ...user, role: 'teacher' });
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm(t('confirmDeleteUser'))) {
      onDeleteUser(userId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
        <div className="bg-white/10 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
          <header className="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
            <h2 className="text-xl font-bold">{t('userManagement')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20" aria-label={t('close')}>
              <XIcon className="h-5 w-5" />
            </button>
          </header>
          <div className="overflow-y-auto p-2 sm:p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/20 text-xs text-gray-300 uppercase">
                  <tr>
                    <th className="p-3">{t('name')}</th>
                    <th className="p-3 hidden sm:table-cell">{t('role')}</th>
                    <th className="p-3">{t('status')}</th>
                    <th className="p-3 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                          <button onClick={() => setViewingProfile(user)} className="text-left hover:text-blue-400">
                            <div>{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </button>
                      </td>
                      <td className="p-3 hidden sm:table-cell capitalize">{t(user.role)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                          {user.isActive ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {currentUser.role === 'teacher' && user.role === 'student' && (
                          <div className="flex justify-end items-center gap-2 flex-wrap">
                            <button onClick={() => handleToggleStatus(user)} className="px-2 py-1 bg-yellow-600/80 hover:bg-yellow-600 rounded text-xs">
                              {user.isActive ? t('deactivate') : t('activate')}
                            </button>
                            <button onClick={() => handlePromote(user)} className="px-2 py-1 bg-purple-600/80 hover:bg-purple-600 rounded text-xs">
                              {t('promoteToTeacher')}
                            </button>
                             <button onClick={() => handleDelete(user.id)} className="px-2 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs">
                              {t('delete')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {viewingProfile && (
        <UserProfileModal 
          user={viewingProfile}
          currentUser={currentUser}
          onClose={() => setViewingProfile(null)}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
        />
      )}
    </>
  );
};

export default UserManagement;