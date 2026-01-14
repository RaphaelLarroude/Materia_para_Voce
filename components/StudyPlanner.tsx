
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../languageContext';
import { 
    XIcon, 
    SparklesIcon, 
    AcademicCapIcon, 
    ClockIcon, 
    TrashIcon,
    SunIcon,
    UtensilsIcon,
    SwatchIcon,
    FlagIcon,
    BookOpenIcon,
    PencilIcon,
    PencilSquareIcon,
    CheckIcon,
    PrinterIcon,
    CalendarDaysIcon,
    PinIcon,
    PlusIcon,
    BeakerIcon,
    GlobeIcon 
} from './icons';
import { Course } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Declarando globalmente para o TypeScript
declare const html2canvas: any;
declare const jspdf: any;

interface StudyPlannerProps {
    onClose: () => void;
    courses: Course[];
    onPinToHub?: (schedule: ScheduleBlock[], theme: string) => void;
}

interface ScheduleBlock {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
    type: 'study' | 'school' | 'meal' | 'sleep' | 'extra' | 'commute' | 'homework' | 'reading';
}

interface ExtraActivity {
    id: string;
    name: string;
    start: string;
    end: string;
    days: string[];
    commuteTo: number;   
    commuteFrom: number; 
}

interface SubjectPerformance {
    name: string;
    level: number;
}

const DAYS = [
    { id: 'Segunda', label: 'Seg' },
    { id: 'Terça', label: 'Ter' },
    { id: 'Quarta', label: 'Qua' },
    { id: 'Quinta', label: 'Qui' },
    { id: 'Sexta', label: 'Sex' },
    { id: 'Sábado', label: 'Sáb' },
    { id: 'Domingo', label: 'Dom' }
];

type AgendaTheme = 'modern_edu' | 'cyber_study' | 'galactic';

export const THEME_CONFIG: Record<AgendaTheme, any> = {
    modern_edu: {
        name: 'Moderno Edu', bg: '#f8fafc', text: 'text-[#2c3e50]', accent: 'bg-[#4f7b7b]', headerBg: 'bg-[#4f7b7b]', slotBg: 'bg-white', title: 'PLANEJADOR SEMANAL', icon: '🏛️',
        blocks: {
            study: 'bg-[#4f7b7b] text-white', school: 'bg-[#78909c] text-white', meal: 'bg-[#90a4ae] text-white', sleep: 'bg-[#263238] text-white', extra: 'bg-purple-600 text-white', commute: 'bg-gray-300 text-gray-600 italic', homework: 'bg-emerald-600 text-white', reading: 'bg-amber-600 text-white'
        }
    },
    cyber_study: {
        name: 'Cyber Study', bg: '#0a0a12', text: 'text-cyan-400', accent: 'bg-magenta-500', headerBg: 'bg-[#1a1a2e]', slotBg: 'bg-[#16213e]/60', title: 'SYSTEM_PLANNER', icon: '👾',
        blocks: {
            study: 'bg-cyan-500/20 border border-cyan-400 text-cyan-300', school: 'bg-purple-500/20 border border-purple-400 text-purple-300', meal: 'bg-pink-500/20 text-pink-300', sleep: 'bg-indigo-900/40 text-indigo-200', extra: 'bg-purple-500/30 text-purple-200', commute: 'bg-slate-800 text-slate-500 italic', homework: 'bg-emerald-500/20 text-emerald-300', reading: 'bg-yellow-500/20 text-yellow-300'
        }
    },
    galactic: {
        name: 'Galáctico', bg: '#000814', text: 'text-blue-100', accent: 'bg-yellow-400', headerBg: 'bg-[#001d3d]', slotBg: 'bg-[#003566]/40', title: 'PLANNER CÓSMICO', icon: '🚀',
        blocks: {
            study: 'bg-yellow-400 text-blue-900 font-bold', school: 'bg-blue-600 text-white', meal: 'bg-pink-500 text-white', sleep: 'bg-slate-800 text-slate-200', extra: 'bg-purple-500 text-white', commute: 'bg-slate-700 text-slate-400 italic', homework: 'bg-emerald-400 text-blue-900', reading: 'bg-amber-400 text-blue-900'
        }
    }
};

const StudyPlanner: React.FC<StudyPlannerProps> = ({ onClose, courses, onPinToHub }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleBlock[]>([]);
    const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<AgendaTheme>('modern_edu');
    const [isCustomizing, setIsCustomizing] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const [routineData, setRoutineData] = useState({
        normalSleep: '22:30',
        normalWake: '07:00',
        lunchTime: '12:30',
        dinnerTime: '19:30',
        dailyStudyHours: 2,
        homeworkMinutes: 45,
        studyDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        difficulties: courses.map(c => ({ name: c.title, level: 5 })) as SubjectPerformance[],
        extraActivities: [] as ExtraActivity[],
        schoolCommuteFrom: 20,
        wantsReading: false,
        readingDuration: 30
    });

    const [newExtra, setNewExtra] = useState<Omit<ExtraActivity, 'id'>>({
        name: '', start: '15:00', end: '16:00', days: [], commuteTo: 15, commuteFrom: 15
    });

    const currentThemeData = THEME_CONFIG[selectedTheme] || THEME_CONFIG.modern_edu;

    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addExtraActivity = () => {
        if (!newExtra.name || newExtra.days.length === 0) return;
        const activity: ExtraActivity = { ...newExtra, id: generateId() };
        setRoutineData(prev => ({ ...prev, extraActivities: [...prev.extraActivities, activity] }));
        setNewExtra({ name: '', start: '15:00', end: '16:00', days: [], commuteTo: 15, commuteFrom: 15 });
    };

    const generatePlanner = async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Crie um cronograma semanal acadêmico em JSON para um aluno.
            DADOS:
            - ACORDAR: ${routineData.normalWake}, DORMIR: ${routineData.normalSleep}
            - REFEIÇÕES: Almoço ${routineData.lunchTime}, Jantar ${routineData.dinnerTime}
            - ESTUDOS: ${routineData.dailyStudyHours}h/dia nos dias ${routineData.studyDays.join(',')}
            - TAREFAS: ${routineData.homeworkMinutes}min/dia
            - PRIORIDADES: ${routineData.difficulties.map(d => `${d.name} (nível ${d.level})`).join(', ')}
            - EXTRAS: ${routineData.extraActivities.map(a => `${a.name}: ${a.start}-${a.end} nos dias ${a.days.join(',')}`).join('; ')}
            - ESCOLA: Manhã (07:30-12:30).
            
            RETORNO: Array JSON de objetos {id, day, startTime, endTime, activity, type}.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                day: { type: Type.STRING },
                                startTime: { type: Type.STRING },
                                endTime: { type: Type.STRING },
                                activity: { type: Type.STRING },
                                type: { type: Type.STRING }
                            },
                            required: ['id', 'day', 'startTime', 'endTime', 'activity', 'type']
                        }
                    }
                }
            });
            const data = JSON.parse(response.text || '[]');
            setGeneratedSchedule(data);
            setStep(3);
        } catch (e) {
            console.error("Erro IA:", e);
            alert("Erro ao gerar cronograma.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateBlock = (updated: ScheduleBlock) => {
        setGeneratedSchedule(prev => prev.map(b => b.id === updated.id ? updated : b));
        setEditingBlock(null);
    };

    const renderDecoration = () => {
        if (selectedTheme === 'galactic') return (
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-600/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-600/20 rounded-full blur-[120px]" />
            </div>
        );
        return null;
    };

    const renderGrid = () => (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="w-full border-separate border-spacing-1.5 min-w-[850px] table-fixed">
                <thead>
                    <tr>
                        <th className="p-3 text-[10px] font-black w-20 uppercase opacity-60">Horário</th>
                        {DAYS.map(d => (
                            <th key={d.id} className={`p-4 text-sm font-black uppercase rounded-2xl transition-all shadow-sm ${currentThemeData.headerBg} ${['modern_edu', 'cyber_study', 'galactic'].includes(selectedTheme) ? 'text-white' : currentThemeData.text}`}>
                                {d.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 15 }, (_, i) => {
                        const slotHour = i + 7;
                        const hourStr = slotHour.toString().padStart(2, '0') + ':00';
                        const slotMinStart = slotHour * 60;
                        const slotMinEnd = (slotHour + 1) * 60;

                        return (
                            <tr key={hourStr} className="min-h-[70px]">
                                <td className="p-2 text-[10px] font-black rounded-xl text-center align-middle opacity-60 bg-white/10">{hourStr}</td>
                                {DAYS.map(day => {
                                    const blocks = generatedSchedule.filter(b => b.day.includes(day.id) && (timeToMinutes(b.startTime) < slotMinEnd && timeToMinutes(b.endTime) > slotMinStart));
                                    return (
                                        <td key={day.id} className={`p-1 relative transition-colors rounded-2xl ${currentThemeData.slotBg} border border-blue-100/50 shadow-inner h-[70px]`}>
                                            {blocks.map((block) => (
                                                <div 
                                                    key={block.id} 
                                                    onClick={() => setEditingBlock(block)}
                                                    className={`absolute inset-1 z-[1] px-2 flex flex-col justify-center text-center overflow-hidden transition-all cursor-pointer rounded-xl hover:brightness-110 hover:scale-[1.03] shadow-md ${currentThemeData.blocks[block.type] || currentThemeData.blocks.study} font-black ring-1 ring-white/20`}
                                                >
                                                    <span className="text-[9px] leading-tight uppercase truncate mb-0.5">{block.activity}</span>
                                                    <span className="text-[8px] opacity-80 leading-none font-bold">{block.startTime}</span>
                                                </div>
                                            ))}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    if (step === 3) {
        return (
            <div id="planner-modal-overlay" className="fixed inset-0 z-[100] flex flex-col animate-fade-in transition-all duration-500 overflow-y-auto custom-scrollbar" style={{ backgroundColor: currentThemeData.bg }}>
                {/* Ações Flutuantes Superiores - Agora com Z-Index altíssimo e fundo mais opaco para não conflitar com Header */}
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-white/95 backdrop-blur-3xl p-2.5 rounded-full border border-blue-100 shadow-2xl print:hidden">
                    <button onClick={() => setIsCustomizing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-50 text-blue-900 border border-blue-50">
                        <SwatchIcon className="w-4 h-4 text-blue-600" /> <span>Visual</span>
                    </button>
                    <div className="h-4 w-px bg-gray-200 mx-0.5"></div>
                    <button onClick={() => setStep(2)} className="px-5 py-2.5 font-black bg-blue-600 text-white rounded-full hover:bg-blue-700 text-[10px] shadow-lg shadow-blue-200 uppercase tracking-widest">Ajustar Dados</button>
                    <button onClick={onClose} className="p-2 bg-red-100/80 hover:bg-red-200 text-red-500 rounded-full transition-colors"><XIcon className="w-4 h-4"/></button>
                </div>

                <div id="planner-export-content" ref={exportRef} className="flex-1 p-6 md:p-12 2xl:p-20 relative z-10">
                    {renderDecoration()}
                    <div className={`max-w-[1400px] mx-auto w-full relative ${currentThemeData.text} pt-20 md:pt-16`}>
                        <header className="mb-10 text-center">
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-3 drop-shadow-sm">{currentThemeData.title}</h2>
                            <div className="flex items-center justify-center gap-4">
                                <span className="h-px w-10 bg-current opacity-30"></span>
                                <p className="text-[10px] font-black opacity-60 tracking-[0.3em] uppercase">{currentThemeData.name}</p>
                                <span className="h-px w-10 bg-current opacity-30"></span>
                            </div>
                        </header>
                        
                        <div className="rounded-[3rem] shadow-2xl p-6 sm:p-10 bg-white/60 backdrop-blur-xl border border-white/80 transition-all">
                            {renderGrid()}
                        </div>

                        <footer className="mt-12 flex flex-wrap justify-center gap-6 print:hidden pb-16">
                             <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-3.5 bg-black text-white font-black rounded-2xl hover:scale-105 transition-all text-[10px] tracking-widest uppercase shadow-2xl">
                                <PrinterIcon className="w-5 h-5" /> Imprimir Planner
                             </button>
                             {onPinToHub && (
                                 <button onClick={() => onPinToHub(generatedSchedule, selectedTheme)} className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-[10px] tracking-widest uppercase shadow-2xl shadow-blue-300 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
                                    <PinIcon className="w-5 h-5" /> Fixar no Meu Painel
                                 </button>
                             )}
                        </footer>
                    </div>
                </div>

                {isCustomizing && (
                    <div className="fixed inset-0 z-[120] flex justify-end animate-fade-in bg-black/50 backdrop-blur-md print:hidden" onClick={() => setIsCustomizing(false)}>
                        <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3"><SwatchIcon className="w-6 h-6" /></div>
                                    <h4 className="font-black uppercase text-base tracking-widest text-blue-900">Estilos Visuais</h4>
                                </div>
                                <button onClick={() => setIsCustomizing(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><XIcon className="w-6 h-6" /></button>
                            </header>
                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                                {Object.keys(THEME_CONFIG).map(theme => {
                                    const cfg = THEME_CONFIG[theme as AgendaTheme];
                                    const isActive = selectedTheme === theme;
                                    return (
                                        <button key={theme} onClick={() => setSelectedTheme(theme as any)} className={`w-full flex items-center gap-5 p-5 rounded-[2rem] border-4 transition-all ${isActive ? 'border-blue-600 bg-blue-50 shadow-xl scale-[1.02]' : 'border-gray-50 hover:border-blue-100 hover:bg-gray-50'}`}>
                                            <div className={`w-14 h-14 rounded-2xl ${cfg.accent} flex items-center justify-center text-white text-2xl shadow-lg`}>{cfg.icon}</div>
                                            <div className="text-left">
                                                <span className="font-black text-xs uppercase tracking-widest text-blue-900 block">{cfg.name}</span>
                                                <span className="text-[10px] text-blue-400 font-bold uppercase mt-1">Tema Acadêmico</span>
                                            </div>
                                            {isActive && <div className="ml-auto bg-blue-600 p-1.5 rounded-full"><CheckIcon className="w-3 h-3 text-white" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
            <div className="bg-white border border-white/60 rounded-[3rem] md:rounded-[4rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-blue-900">
                <header className="px-8 md:px-12 py-8 flex justify-between items-center shrink-0 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl text-white rotate-3"><AcademicCapIcon className="w-7 h-7" /></div>
                        <div><h2 className="text-xl md:text-2xl font-black tracking-tighter">Planejador Inteligente</h2><p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em]">Configuração de Rotina</p></div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all"><XIcon className="h-6 w-6" /></button>
                </header>

                <main className="flex-1 overflow-y-auto px-8 md:px-12 pb-12 pt-8 space-y-12 custom-scrollbar">
                    {step === 1 ? (
                        <div className="animate-fade-in text-center py-10 space-y-12">
                            <div className="max-w-md mx-auto space-y-4">
                                <h3 className="text-2xl md:text-3xl font-black text-blue-900 tracking-tighter uppercase">Defina seu estilo</h3>
                                <p className="text-sm text-blue-800/60 font-bold leading-relaxed">Como você prefere que a inteligência artificial organize seu tempo?</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                <button onClick={() => setStep(2)} className="p-8 md:p-10 rounded-[3rem] border-4 border-gray-100 bg-white hover:border-blue-600 transition-all text-left group shadow-sm hover:shadow-2xl hover:-translate-y-1">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ClockIcon className="w-8 h-8" /></div>
                                    <h3 className="text-xl font-black mb-2">Cronograma Semanal</h3>
                                    <p className="text-xs text-blue-700/70 font-bold leading-relaxed">Ideal para quem busca uma rotina fixa com horários definidos de sono, escola e estudos.</p>
                                </button>
                                <div className="p-8 md:p-10 rounded-[3rem] border-4 border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed text-left relative overflow-hidden group">
                                    <div className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-[9px] font-black px-3 py-1 rounded-full uppercase">Em Breve</div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-200 text-gray-400 flex items-center justify-center mb-6"><SparklesIcon className="w-8 h-8" /></div>
                                    <h3 className="text-xl font-black mb-2">Ciclo de Estudos</h3>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed">Para quem tem rotina imprevisível e prefere estudar por metas de horas acumuladas.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-12 max-w-2xl mx-auto pb-12">
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><SunIcon className="w-5 h-5 text-yellow-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Horários Base</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:gap-6 bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner">
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Acordar</label>
                                        <input type="time" value={routineData.normalWake} onChange={e => setRoutineData({...routineData, normalWake: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Dormir</label>
                                        <input type="time" value={routineData.normalSleep} onChange={e => setRoutineData({...routineData, normalSleep: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Almoço</label>
                                        <input type="time" value={routineData.lunchTime} onChange={e => setRoutineData({...routineData, lunchTime: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Jantar</label>
                                        <input type="time" value={routineData.dinnerTime} onChange={e => setRoutineData({...routineData, dinnerTime: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><FlagIcon className="w-5 h-5 text-blue-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Metas de Estudo</h4>
                                </div>
                                <div className="bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest">Carga horária diária</label>
                                            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black shadow-lg shadow-blue-200">{routineData.dailyStudyHours} Horas</span>
                                        </div>
                                        <input type="range" min="1" max="6" step="1" value={routineData.dailyStudyHours} onChange={e => setRoutineData({...routineData, dailyStudyHours: parseInt(e.target.value)})} className="w-full h-2.5 bg-white rounded-full appearance-none cursor-pointer accent-blue-600 border border-blue-100" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Dias de Estudo Ativo</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS.map(day => (
                                                <button 
                                                    key={day.id} 
                                                    onClick={() => setRoutineData(prev => ({...prev, studyDays: prev.studyDays.includes(day.id) ? prev.studyDays.filter(d => d !== day.id) : [...prev.studyDays, day.id]}))}
                                                    className={`px-4 py-2.5 rounded-2xl text-[10px] font-black border-2 transition-all shadow-sm ${routineData.studyDays.includes(day.id) ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-blue-200' : 'bg-white border-blue-50 text-blue-300 hover:border-blue-100'}`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><BeakerIcon className="w-5 h-5 text-purple-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Atividades Extra</h4>
                                </div>
                                <div className="bg-purple-50/30 p-6 md:p-8 rounded-[2.5rem] border border-purple-100 shadow-inner space-y-6">
                                    <div className="space-y-4 bg-white p-5 rounded-[2rem] border border-purple-50 shadow-sm">
                                        <input placeholder="Ex: Natação, Inglês, Música..." value={newExtra.name} onChange={e => setNewExtra({...newExtra, name: e.target.value})} className="w-full border-b border-gray-100 py-3 outline-none font-black text-base placeholder:text-gray-300" />
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-black text-purple-300 uppercase block mb-1">Início</label>
                                                <input type="time" value={newExtra.start} onChange={e => setNewExtra({...newExtra, start: e.target.value})} className="w-full text-xs font-black p-2.5 bg-purple-50 rounded-xl outline-none" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[9px] font-black text-purple-300 uppercase block mb-1">Fim</label>
                                                <input type="time" value={newExtra.end} onChange={e => setNewExtra({...newExtra, end: e.target.value})} className="w-full text-xs font-black p-2.5 bg-purple-50 rounded-xl outline-none" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {DAYS.map(d => (
                                                <button key={d.id} onClick={() => setNewExtra(prev => ({...prev, days: prev.days.includes(d.id) ? prev.days.filter(item => item !== d.id) : [...prev.days, d.id]}))} className={`w-8 h-8 rounded-xl text-[9px] font-black border-2 transition-all ${newExtra.days.includes(d.id) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white text-purple-200 border-purple-50'}`}>{d.label}</button>
                                            ))}
                                        </div>
                                        <button onClick={addExtraActivity} className="w-full py-3.5 bg-purple-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 mt-2">Registrar Atividade</button>
                                    </div>
                                    <div className="space-y-3">
                                        {routineData.extraActivities.map(a => (
                                            <div key={a.id} className="flex items-center justify-between bg-white/80 p-4 rounded-2xl border border-purple-50 hover:bg-white transition-colors">
                                                <div>
                                                    <p className="font-black text-xs text-blue-900 leading-tight">{a.name}</p>
                                                    <p className="text-[9px] text-purple-400 font-bold uppercase mt-0.5">{a.start}-{a.end} • {a.days.map(d => d.substring(0,3)).join(', ')}</p>
                                                </div>
                                                <button onClick={() => setRoutineData(p => ({...p, extraActivities: p.extraActivities.filter(item => item.id !== a.id)}))} className="p-2.5 bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 rounded-xl transition-all"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <div className="pt-6">
                                <button onClick={generatePlanner} disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest border-b-6 border-blue-800 disabled:opacity-50">
                                    {isLoading ? 'A IA está organizando seu tempo...' : <><SparklesIcon className="w-6 h-6" /> Gerar Meu Cronograma</>}
                                </button>
                                <button onClick={() => setStep(1)} className="w-full text-center text-[10px] font-black uppercase text-blue-300 tracking-widest hover:text-blue-600 mt-6 transition-colors">Voltar para escolha de estratégia</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudyPlanner;
