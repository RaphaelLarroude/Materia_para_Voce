import React, { useState } from 'react';
import { useLanguage } from '../languageContext';
import { Classroom, SchoolYear } from '../types';
import { supabase } from '../supabaseClient';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classroom, setClassroom] = useState<Classroom | ''>('');
  const [year, setYear] = useState<SchoolYear | ''>('');

  const { t } = useLanguage();

  const clearForm = () => {
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
    setClassroom('');
    setYear('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (!year) throw new Error(t('yearRequired'));
        if (!classroom) throw new Error(t('classroomRequired'));
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'student',
                    isActive: true,
                    year,
                    classroom,
                }
            }
        });
        if (error) throw error;
        // Supabase onAuthStateChange will handle login
      } else { // Login mode
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        // Supabase onAuthStateChange will handle login
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const switchMode = () => {
    clearForm();
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-2">
          {authMode === 'login' ? t('login') : t('signUp')}
        </h1>
        <p className="text-center text-gray-300 mb-8">Matéria para Você</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('name')}</label>
                <input
                  type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-300">{t('year')}</label>
                  <select id="year" name="year" value={year} onChange={(e) => setYear(Number(e.target.value) as SchoolYear)} required
                    className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>{t('selectYear')}</option>
                    {[6, 7, 8, 9].map(y => <option key={y} value={y}>{y}º Ano</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="classroom" className="block text-sm font-medium text-gray-300">{t('classroom')}</label>
                  <select id="classroom" name="classroom" value={classroom} onChange={(e) => setClassroom(e.target.value as Classroom)} required
                    className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>{t('selectClassroom')}</option>
                    {['A', 'B', 'C', 'D', 'E'].map(c => <option key={c} value={c}>Sala {c}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">{t('email')}</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">{t('password')}</label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : (authMode === 'login' ? t('login') : t('signUp'))}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm">
            {authMode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
            <button onClick={switchMode} className="font-medium text-blue-400 hover:text-blue-300">
              {authMode === 'login' ? t('signUp') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;