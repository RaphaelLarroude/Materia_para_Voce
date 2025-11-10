import React from 'react';
import { User, StoredUser } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon } from '../icons';

interface UserProfileModalProps {
  user: StoredUser;
  currentUser: User;
  onUpdateUser: (user: StoredUser) => void;
  onDeleteUser: (userId: string) => void;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, currentUser, onUpdateUser, onDeleteUser, onClose }) => {
  const { t } = useLanguage();

  const handleToggleStatus = () => {
    const confirmMessage = user.isActive ? t('confirmDeactivateUser') : t('confirmActivateUser');
    if (window.confirm(confirmMessage)) {
      onUpdateUser({ ...user, isActive: !user.isActive });
      onClose();
    }
  };

  const handlePromote = () => {
    if (window.confirm(t('confirmPromoteUser'))) {
        onUpdateUser({ ...user, role: 'teacher' });
        onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('confirmDeleteUser'))) {
      onDeleteUser(user.id);
      onClose();
    }
  };

  const DetailItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
      <dt className="text-sm font-medium text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value}</dd>
    </div>
  );

  return (
     <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl text-white">
        <header className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-lg font-bold">{t('userProfile')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
        </header>
        
        <div className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-4xl border-2 border-white/50 flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem label={t('role')} value={<span className="capitalize">{t(user.role)}</span>} />
                <DetailItem label={t('status')} value={
                    <span className={`px-2 py-0.5 text-xs rounded-full ${user.isActive ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                        {user.isActive ? t('active') : t('inactive')}
                    </span>
                }/>
                <DetailItem label={t('year')} value={`${user.year}º Ano`} />
                <DetailItem label={t('classroom')} value={`Sala ${user.classroom}`} />
            </dl>
        </div>

        {currentUser.role === 'teacher' && user.role === 'student' && (
            <footer className="p-4 bg-black/20 border-t border-white/10 flex justify-end items-center gap-2 flex-wrap">
                <button onClick={handleToggleStatus} className="px-3 py-1.5 bg-yellow-600/80 hover:bg-yellow-600 rounded text-xs font-semibold">
                    {user.isActive ? t('deactivate') : t('activate')}
                </button>
                <button onClick={handlePromote} className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 rounded text-xs font-semibold">
                    {t('promoteToTeacher')}
                </button>
                <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded text-xs font-semibold">
                    {t('delete')}
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;