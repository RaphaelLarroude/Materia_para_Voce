import React, { useState } from 'react';
import { User } from '../types';
import Auth from './Auth';
import Footer from './Footer';
import { useLanguage } from '../languageContext';
import { BookOpenIcon, AcademicCapIcon, ClockIcon, PaintBrushIcon } from './icons';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl text-center flex flex-col items-center">
    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 border-2 border-white/50">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-200 text-sm leading-relaxed">{children}</p>
  </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const { t } = useLanguage();

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSuccess = (user: User) => {
    onLoginSuccess(user);
    closeAuthModal();
  };

  return (
    <>
      <div className="min-h-screen flex flex-col text-white font-sans">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              Matéria para Você
            </h1>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => openAuthModal('login')}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"
              >
                {t('login')}
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-transform hover:scale-105"
              >
                {t('signUp')}
              </button>
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard icon={<BookOpenIcon className="w-8 h-8 text-white"/>} title="Gestão de Cursos">
                    Para professores: crie e organize cursos, módulos e materiais com total controle de visibilidade.
                </FeatureCard>
                <FeatureCard icon={<AcademicCapIcon className="w-8 h-8 text-white"/>} title="Acesso Simplificado">
                    Para alunos: encontre todos os seus materiais de estudo, links e tarefas em um só lugar.
                </FeatureCard>
                <FeatureCard icon={<ClockIcon className="w-8 h-8 text-white"/>} title="Calendário Integrado">
                    Acompanhe provas, entregas de trabalhos e eventos escolares de forma visual e nunca perca um prazo.
                </FeatureCard>
                <FeatureCard icon={<PaintBrushIcon className="w-8 h-8 text-white"/>} title="Interface 'Liquid Glass'">
                    Desfrute de uma experiência de usuário única com um design moderno que é tão bonito quanto funcional.
                </FeatureCard>
            </div>
          </div>
          
           <div className="mt-16 max-w-3xl w-full mx-auto">
             <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <p className="text-lg text-gray-100 text-center mb-2">
                MATÉRIA PARA VOCÊ é um projeto cujo objetivo é ensinar a matéria escolar para os alunos, para aprenderem o conteúdo de maneira mais fácil, através de um conjunto de materiais diversos, onde há a matéria resumida, chamado de Roteiro de Estudos.
              </p>
              <p className="text-lg text-gray-100 text-center">
                Nós visamos ajudar todos os alunos a estudarem e entenderem o conteúdo, através do nosso estudo.
              </p>
            </div>
          </div>

        </main>
        <Footer />
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <Auth
            onLoginSuccess={handleSuccess}
            initialMode={authInitialMode}
            onClose={closeAuthModal}
          />
        </div>
      )}
    </>
  );
};

export default LandingPage;