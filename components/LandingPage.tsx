import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Auth from './Auth';
import { useLanguage } from '../languageContext';
import { 
    AcademicCapIcon, 
    MenuIcon, 
    XIcon, 
    CalendarIcon,
    UserGroupIcon,
    MegaphoneIcon,
    CheckIcon,
    AppLogoIcon
} from './icons';
import Footer from './Footer';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  
  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsMobileMenuOpen(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-40 transition-all duration-300 px-4 md:px-12 py-3 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md border-b border-white/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
                <AppLogoIcon className="w-10 h-10 shadow-lg" />
                <span className={`font-bold text-xl tracking-tight ${isScrolled ? 'text-blue-900' : 'text-blue-900 md:text-white shadow-black/20 drop-shadow-md'}`}>
                    Matéria para Você
                </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                {['Sobre', 'Contato'].map((item) => (
                    <button 
                        key={item} 
                        onClick={() => scrollToSection(item.toLowerCase())}
                        className={`text-sm font-semibold hover:opacity-80 transition-opacity ${isScrolled ? 'text-blue-800' : 'text-white drop-shadow-md'}`}
                    >
                        {item}
                    </button>
                ))}
                <button 
                    onClick={() => openAuthModal('login')}
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${isScrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-900 hover:bg-blue-50'}`}
                >
                    {t('login')}
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 text-blue-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <XIcon className="w-7 h-7"/> : <MenuIcon className={`w-7 h-7 ${!isScrolled && !isMobileMenuOpen ? 'text-white' : 'text-blue-900'}`}/>}
            </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/40 flex flex-col gap-2">
                {['Sobre', 'Contato'].map((item) => (
                    <button 
                        key={item} 
                        onClick={() => scrollToSection(item.toLowerCase())}
                        className="text-left py-3 px-4 hover:bg-blue-50 rounded-xl text-blue-900 font-medium"
                    >
                        {item}
                    </button>
                ))}
                 <button 
                    onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                    className="text-center py-3 px-4 bg-blue-600 text-white rounded-xl font-bold mt-2"
                >
                    {t('login')}
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 md:pt-40 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 text-center md:text-left animate-fade-in-up">
                    <div className="inline-block px-4 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-900 font-semibold text-sm mb-6 backdrop-blur-sm">
                        Transforme seu aprendizado
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
                        Seu portal de <span className="text-blue-600">conhecimento</span> e organização.
                    </h1>
                    <p className="text-lg text-blue-800 mb-8 leading-relaxed max-w-xl mx-auto md:mx-0 bg-white/30 p-4 rounded-xl backdrop-blur-sm border border-white/40">
                        Acesse roteiros de estudo, materiais exclusivos e organize sua vida escolar em um único lugar. O futuro da educação começa aqui.
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-12">
                        <button 
                            onClick={() => scrollToSection('hub')}
                            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-transform hover:scale-105 flex items-center gap-2"
                        >
                            Começar Agora <AcademicCapIcon className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={() => scrollToSection('sobre')}
                            className="px-8 py-4 bg-white/40 text-blue-900 font-bold rounded-xl border border-white/50 hover:bg-white/60 transition-transform hover:scale-105 backdrop-blur-md"
                        >
                            Saiba Mais
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 relative w-full max-w-lg md:max-w-none">
                    <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/30 relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent z-10"></div>
                        <img 
                            src="https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                            alt="Estudantes aprendendo" 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                    <UserGroupIcon className="w-6 h-6"/>
                                </div>
                                <div>
                                    <p className="font-bold text-blue-900">Comunidade Ativa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Quadro de Avisos Section (Notice Board) */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400"></div>
                
                <h2 className="text-3xl font-bold text-center mb-10 text-blue-900 flex items-center justify-center gap-3">
                    <MegaphoneIcon className="w-8 h-8 text-blue-600"/>
                    Quadro de Avisos
                </h2>

                <div className="flex justify-center">
                    {[
                        { title: "Novidades", date: "Aviso", desc: "2026 virá com muitas novidades...", type: "Importante" }
                    ].map((notice, idx) => (
                        <div key={idx} className="bg-white/40 rounded-xl p-6 border border-white/50 hover:bg-white/60 transition-colors max-w-2xl w-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">{notice.type}</span>
                                <span className="text-sm font-medium text-blue-500 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {notice.date}</span>
                            </div>
                            <h3 className="font-bold text-lg text-blue-900 mb-2">{notice.title}</h3>
                            <p className="text-blue-800 text-sm leading-relaxed">{notice.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Sobre o Projeto (About) */}
      <section id="sobre" className="py-20 px-6 md:px-12 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl font-bold text-blue-900 mb-6">Sobre a Metodologia</h2>
                    <div className="space-y-6 text-blue-800 leading-relaxed">
                        <p className="bg-white/30 p-4 rounded-xl border border-white/40">
                            O <strong>Matéria para Você</strong> nasceu da necessidade de centralizar o conhecimento. Inspirado nas melhores práticas de LMS (Learning Management Systems), oferecemos uma estrutura clara onde o aluno sabe exatamente o que estudar.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5"><CheckIcon className="w-4 h-4"/></div>
                                <span><strong>Organização por Módulos:</strong> Conteúdo dividido em blocos digeríveis.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5"><CheckIcon className="w-4 h-4"/></div>
                                <span><strong>Interatividade:</strong> Links diretos para plataformas como Canva, Padlet e Matific.</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="grid grid-cols-2 gap-4 relative">
                        <img src="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Estudo em grupo" className="rounded-2xl shadow-lg border border-white/40 w-full h-48 object-cover"/>
                        <img src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Mentoria" className="rounded-2xl shadow-lg border border-white/40 w-full h-48 object-cover translate-y-8"/>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Hub Digital (Call to Action) */}
      <section id="hub" className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Hub Digital</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                        Conecte-se com a comunidade, acesse conteúdos exclusivos e gerencie seus estudos. Tudo pronto para você começar?
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                         <button 
                            onClick={() => openAuthModal('login')}
                            className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-transform hover:scale-105 shadow-lg"
                        >
                            Acessar Plataforma
                        </button>
                        <button 
                            onClick={() => openAuthModal('signup')}
                            className="px-8 py-4 bg-blue-700 text-white font-bold rounded-xl border border-blue-400 hover:bg-blue-600 transition-transform hover:scale-105"
                        >
                            Criar Conta Grátis
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-blue-200">Junte-se a nós hoje mesmo.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <div id="contato">
        <Footer />
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <Auth
            onLoginSuccess={handleSuccess}
            initialMode={authInitialMode}
            onClose={closeAuthModal}
          />
        </div>
      )}
    </div>
  );
};

export default LandingPage;