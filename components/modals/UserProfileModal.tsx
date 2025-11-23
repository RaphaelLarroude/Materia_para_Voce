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
      <dt className="text-sm font-medium text-blue-500">{label}</dt>
      <dd className="mt-1 text-sm text-blue-900">{value}</dd>
    </div>
  );

  return (
     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl w-full max-w-md shadow-2xl text-blue-900">
        <header className="flex justify-between items-center p-4 border-b border-blue-100/50">
          <h2 className="text-lg font-bold">{t('userProfile')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/30 text-blue-500 hover:text-blue-800"><XIcon className="w-5 h-5" /></button>
        </header>
        
        <div className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-4xl shadow-md flex-shrink-0 border border-white">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-blue-900">{user.name}</h3>
                    <p className="text-sm text-blue-600">{user.email}</p>
                </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem label={t('role')} value={<span className="capitalize">{t(user.role)}</span>} />
                <DetailItem label={t('status')} value={
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? t('active') : t('inactive')}
                    </span>
                }/>
                <DetailItem label={t('year')} value={`${user.year}º Ano`} />
                <DetailItem label={t('classroom')} value={`Sala ${user.classroom}`} />
            </dl>
        </div>

        {currentUser.role === 'teacher' && user.role === 'student' && (
            <footer className="p-4 bg-blue-50/50 border-t border-blue-100/50 flex justify-end items-center gap-2 flex-wrap rounded-b-2xl">
                <button onClick={handleToggleStatus} className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs font-semibold transition-colors">
                    {user.isActive ? t('deactivate') : t('activate')}
                </button>
                <button onClick={handlePromote} className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-semibold transition-colors">
                    {t('promoteToTeacher')}
                </button>
                <button onClick={handleDelete} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition-colors">
                    {t('delete')}
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;