import React, { useState, useEffect, useRef } from 'react';
import { User, Classroom, SchoolYear } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon, PhotoIcon, CheckIcon } from '../icons';
import { fileToBase64 } from '../../utils/file';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onSave: (updatedData: Partial<User>, passwordData?: { current: string, new: string }) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile state
    const [name, setName] = useState(currentUser.name);
    const [profilePictureUrl, setProfilePictureUrl] = useState(currentUser.profilePictureUrl || '');
    const [classroom, setClassroom] = useState<Classroom>(currentUser.classroom);
    const [year, setYear] = useState<SchoolYear>(currentUser.year);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(currentUser.name);
            setProfilePictureUrl(currentUser.profilePictureUrl || '');
            setClassroom(currentUser.classroom);
            setYear(currentUser.year);
            setError('');
            setSuccessMessage('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    }, [isOpen, currentUser]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setProfilePictureUrl(base64);
            } catch (err) {
                setError('Failed to read file.');
            }
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        // Password validation
        const isChangingPassword = newPassword || currentPassword || confirmNewPassword;
        if (isChangingPassword) {
            if (newPassword.length > 0 && newPassword.length < 6) {
                setError(t('passwordTooShort'));
                return;
            }
            if (newPassword !== confirmNewPassword) {
                setError(t('passwordsDoNotMatch'));
                return;
            }
        }
        
        setIsLoading(true);
        try {
            const profileData: Partial<User> = {
                name,
                profilePictureUrl,
                classroom,
                year,
            };
            
            await onSave(
                profileData,
                isChangingPassword ? { current: currentPassword, new: newPassword } : undefined
            );
            
            setSuccessMessage(isChangingPassword && newPassword ? t('passwordUpdatedSuccessfully') : t('profileUpdatedSuccessfully'));
            
            // Clear password fields after successful change
            if (isChangingPassword) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            }

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl text-white max-h-[90vh] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
              <h2 className="text-lg font-bold">{t('profileSettings')}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
            </header>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto">
              
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                  <div className="relative">
                      {profilePictureUrl ? (
                          <img src={profilePictureUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover"/>
                      ) : (
                         <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
                             {name.charAt(0).toUpperCase()}
                         </div>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1 bg-white/20 rounded-full hover:bg-white/30">
                          <PhotoIcon className="w-4 h-4 text-white"/>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                  </div>
                  <div className="flex-grow">
                      <label htmlFor="profile-name" className="block text-sm font-medium text-gray-200">{t('name')}</label>
                      <input id="profile-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="profile-year" className="block text-sm font-medium text-gray-200">{t('year')}</label>
                  <select id="profile-year" value={year} onChange={(e) => setYear(Number(e.target.value) as SchoolYear)} required
                    className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[6, 7, 8, 9].map(y => <option key={y} value={y}>{y}º Ano</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="profile-classroom" className="block text-sm font-medium text-gray-200">{t('classroom')}</label>
                  <select id="profile-classroom" value={classroom} onChange={(e) => setClassroom(e.target.value as Classroom)} required
                    className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['A', 'B', 'C', 'D', 'E'].map(c => <option key={c} value={c}>Sala {c}</option>)}
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-md font-semibold">{t('passwordChange')}</h3>
                  <div>
                      <label htmlFor="current-password" className="text-sm font-medium text-gray-200">{t('currentPassword')}</label>
                      <input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                      <label htmlFor="new-password" className="text-sm font-medium text-gray-200">{t('newPassword')}</label>
                      <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                   <div>
                      <label htmlFor="confirm-new-password" className="text-sm font-medium text-gray-200">{t('confirmNewPassword')}</label>
                      <input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {successMessage && <p className="text-green-400 text-sm flex items-center gap-2"><CheckIcon className="w-4 h-4"/>{successMessage}</p>}

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">{t('close')}</button>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800">
                    {isLoading ? t('saving') : t('save')}
                  </button>
              </div>
            </form>
          </div>
        </div>
    );
};

export default ProfileModal;