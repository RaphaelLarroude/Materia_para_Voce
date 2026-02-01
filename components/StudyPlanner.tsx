
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
    GlobeIcon,
    DownloadIcon,
    PhotoIcon,
    DocumentIcon,
    ArrowRightIcon
} from './icons';
import { Course } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Declarando globalmente para o TypeScript
declare const html2canvas: any;
declare const jspdf: any;

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
    { id: 'Domingo', label: 'Dom' },
    { id: 'Segunda', label: 'Seg' },
    { id: 'Terça', label: 'Ter' },
    { id: 'Quarta', label: 'Qua' },
    { id: 'Quinta', label: 'Qui' },
    { id: 'Sexta', label: 'Sex' },
    { id: 'Sábado', label: 'Sáb' }
];

type AgendaTheme = 'modern_edu' | 'cyber_study' | 'galactic' | 'garden' | 'retro' | 'oceanic' | 'sunset' | 'magic' | 'minimal' | 'dark_pro';

export const THEME_CONFIG: Record<AgendaTheme, any> = {
    modern_edu: {
        name: 'Moderno Edu', bg: '#f8fafc', text: 'text-[#2c3e50]', accent: 'bg-[#4f7b7b]', headerBg: 'bg-[#4f7b7b]', slotBg: 'bg-white', title: 'PLANEJADOR SEMANAL', icon: '🏛️',
        blocks: { study: 'bg-[#4f7b7b] text-white', school: 'bg-[#78909c] text-white', meal: 'bg-[#90a4ae] text-white', sleep: 'bg-[#263238] text-white', extra: 'bg-purple-600 text-white', commute: 'bg-blue-50 text-blue-600 border-2 border-dashed border-blue-200 font-bold', homework: 'bg-emerald-600 text-white', reading: 'bg-amber-600 text-white' }
    },
    cyber_study: {
        name: 'Cyber Study', bg: '#0a0a12', text: 'text-cyan-400', accent: 'bg-magenta-500', headerBg: 'bg-[#1a1a2e]', slotBg: 'bg-[#16213e]/60', title: 'SYSTEM_PLANNER', icon: '👾',
        blocks: { study: 'bg-cyan-500/20 border border-cyan-400 text-cyan-300', school: 'bg-purple-500/20 border border-purple-400 text-purple-300', meal: 'bg-pink-500/20 text-pink-300', sleep: 'bg-indigo-900/40 text-indigo-200', extra: 'bg-purple-500/30 text-purple-200', commute: 'bg-slate-800 text-slate-400 border border-slate-600 border-dotted', homework: 'bg-emerald-500/20 text-emerald-300', reading: 'bg-yellow-500/20 text-yellow-300' }
    },
    galactic: {
        name: 'Galáctico', bg: '#000814', text: 'text-blue-100', accent: 'bg-yellow-400', headerBg: 'bg-[#001d3d]', slotBg: 'bg-[#003566]/40', title: 'PLANNER CÓSMICO', icon: '🚀',
        blocks: { study: 'bg-yellow-400 text-blue-900 font-bold', school: 'bg-blue-600 text-white', meal: 'bg-pink-500 text-white', sleep: 'bg-slate-800 text-slate-200', extra: 'bg-purple-500 text-white', commute: 'bg-blue-900/40 text-blue-300 border border-blue-500/30', homework: 'bg-emerald-400 text-blue-900', reading: 'bg-amber-400 text-blue-900' }
    },
    garden: {
        name: 'Jardim Botânico', bg: '#f0fdf4', text: 'text-emerald-900', accent: 'bg-emerald-600', headerBg: 'bg-emerald-700', slotBg: 'bg-white', title: 'ESTUDOS & NATUREZA', icon: '🌿',
        blocks: { study: 'bg-emerald-600 text-white', school: 'bg-lime-600 text-white', meal: 'bg-orange-400 text-white', sleep: 'bg-teal-900 text-white', extra: 'bg-pink-500 text-white', commute: 'bg-emerald-100 text-emerald-700 border border-emerald-200', homework: 'bg-green-700 text-white', reading: 'bg-amber-500 text-white' }
    },
    retro: {
        name: 'Retro 8-Bit', bg: '#fef3c7', text: 'text-orange-950', accent: 'bg-orange-600', headerBg: 'bg-orange-800', slotBg: 'bg-orange-50', title: 'LEVEL UP PLANNER', icon: '🕹️',
        blocks: { study: 'bg-red-600 text-white uppercase', school: 'bg-blue-700 text-white uppercase', meal: 'bg-yellow-500 text-black uppercase', sleep: 'bg-black text-white uppercase', extra: 'bg-purple-600 text-white uppercase', commute: 'bg-orange-200 text-orange-800 border-2 border-orange-400', homework: 'bg-emerald-600 text-white uppercase', reading: 'bg-indigo-600 text-white uppercase' }
    },
    oceanic: {
        name: 'Oceanic Flow', bg: '#f0f9ff', text: 'text-sky-950', accent: 'bg-sky-600', headerBg: 'bg-sky-800', slotBg: 'bg-white', title: 'FLUXO DE ESTUDOS', icon: '🌊',
        blocks: { study: 'bg-sky-600 text-white', school: 'bg-indigo-600 text-white', meal: 'bg-cyan-500 text-white', sleep: 'bg-slate-900 text-white', extra: 'bg-violet-600 text-white', commute: 'bg-sky-100 text-sky-700 border border-sky-300', homework: 'bg-blue-700 text-white', reading: 'bg-teal-600 text-white' }
    },
    sunset: {
        name: 'Sunset Focus', bg: '#fff7ed', text: 'text-orange-950', accent: 'bg-orange-500', headerBg: 'bg-rose-700', slotBg: 'bg-white', title: 'CREPÚSCULO ACADÊMICO', icon: '🌇',
        blocks: { study: 'bg-orange-500 text-white', school: 'bg-rose-600 text-white', meal: 'bg-amber-400 text-black font-bold', sleep: 'bg-purple-950 text-white', extra: 'bg-fuchsia-600 text-white', commute: 'bg-rose-50 text-rose-700 border border-rose-200', homework: 'bg-orange-700 text-white', reading: 'bg-yellow-600 text-white' }
    },
    magic: {
        name: 'Academia Mágica', bg: '#111', text: 'text-amber-100', accent: 'bg-amber-500', headerBg: 'bg-[#2d1b4d]', slotBg: 'bg-[#1a0f2e]', title: 'GRIMÓRIO DE TEMPO', icon: '🪄',
        blocks: { study: 'bg-amber-500 text-black font-black', school: 'bg-indigo-700 text-white', meal: 'bg-rose-800 text-white', sleep: 'bg-black text-amber-200 border border-amber-900', extra: 'bg-violet-900 text-white', commute: 'bg-slate-900 text-amber-400 border-dashed border-amber-900', homework: 'bg-emerald-900 text-white', reading: 'bg-amber-800 text-white' }
    },
    minimal: {
        name: 'Essencial Clean', bg: '#ffffff', text: 'text-slate-900', accent: 'bg-slate-900', headerBg: 'bg-slate-900', slotBg: 'bg-slate-50', title: 'PLANNER ESSENCIAL', icon: '⚪',
        blocks: { study: 'bg-slate-800 text-white', school: 'bg-slate-400 text-white', meal: 'bg-slate-200 text-slate-900 border border-slate-300', sleep: 'bg-slate-950 text-slate-400', extra: 'bg-slate-600 text-white', commute: 'bg-white text-slate-500 border border-slate-200', homework: 'bg-slate-700 text-white', reading: 'bg-slate-500 text-white' }
    },
    dark_pro: {
        name: 'High-Contrast Dark', bg: '#0f172a', text: 'text-slate-200', accent: 'bg-blue-600', headerBg: 'bg-blue-900', slotBg: 'bg-slate-900/50', title: 'PRO_WORKFLOW', icon: '🌑',
        blocks: { study: 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]', school: 'bg-slate-700 text-white', meal: 'bg-rose-600 text-white', sleep: 'bg-slate-950 text-blue-400 border border-blue-900', extra: 'bg-indigo-600 text-white', commute: 'bg-slate-800 text-slate-500 border border-slate-700', homework: 'bg-emerald-600 text-white', reading: 'bg-cyan-600 text-white' }
    }
};

interface StudyPlannerProps {
    onClose: () => void;
    courses: Course[];
    onSavePlanner?: (schedule: ScheduleBlock[], theme: string) => void;
    initialData?: { blocks: ScheduleBlock[], theme: string } | null;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ onClose, courses, onSavePlanner, initialData }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(initialData ? 3 : 1);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleBlock[]>(initialData ? initialData.blocks : []);
    const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<AgendaTheme>(initialData ? (initialData.theme as AgendaTheme) : 'modern_edu');
    const [isCustomizing, setIsCustomizing] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const [routineData, setRoutineData] = useState({
        normalSleep: '22:30',
        normalWake: '07:00',
        lunchTime: '12:30',
        dinnerTime: '19:30',
        schoolCommuteTo: 20,
        schoolCommuteFrom: 20,
        dailyStudyHours: 2,
        homeworkMinutes: 45,
        studyDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        difficulties: courses.length > 0 
            ? courses.map(c => ({ name: c.title, level: 5 })) 
            : [{ name: 'Matemática', level: 5 }, { name: 'Português', level: 5 }] as SubjectPerformance[],
        extraActivities: [] as ExtraActivity[],
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

    const updateDifficulty = (name: string, level: number) => {
        setRoutineData(prev => ({
            ...prev,
            difficulties: prev.difficulties.map(d => d.name === name ? { ...d, level } : d)
        }));
    };

    const generatePlanner = async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Aja como um Engenheiro de Planejamento Acadêmico. Sua tarefa é criar um cronograma semanal impecável no formato JSON.

            DADOS OBRIGATÓRIOS DO ALUNO:
            1. CICLO BIOLÓGICO: Acordar ${routineData.normalWake}, Dormir ${routineData.normalSleep}. Almoço ${routineData.lunchTime} (Duração 1h), Jantar ${routineData.dinnerTime} (Duração 1h).
            
            2. ESCOLA E TRANSPORTE (ID PRIORIDADE 1):
               - Dias: Seg, Ter, Qui (07:50-16:10) | Qua, Sex (07:50-12:35).
               - IDA AO COLÉGIO: Crie OBRIGATORIAMENTE um bloco de ${routineData.schoolCommuteTo} minutos ANTES das 07:50 chamado "Deslocamento (Ida Escola)" com type: 'commute'.
               - VOLTA DO COLÉGIO: Crie OBRIGATORIAMENTE um bloco de ${routineData.schoolCommuteFrom} minutos IMEDIATAMENTE após a saída (16:10 ou 12:35) chamado "Deslocamento (Volta Escola)" com type: 'commute'.
            
            3. EXTRAS:
               ${routineData.extraActivities.map(a => `- ${a.name}: ${a.start}-${a.end} em [${a.days.join(', ')}]. Incluir ${a.commuteTo}min ida e ${a.commuteFrom}min volta como 'commute'.`).join('\n')}

            4. ESTUDO E METAS (DISTRIBUIR NOS ESPAÇOS DISPONÍVEIS):
               - Meta de estudo ativo: ${routineData.dailyStudyHours}h em [${routineData.studyDays.join(', ')}].
               - Lição de casa: ${routineData.homeworkMinutes} min/dia.
               - ${routineData.wantsReading ? `Leitura: ${routineData.readingDuration} min/dia.` : ''}
               - Pesos: ${routineData.difficulties.map(d => `${d.name} (Nível ${d.level})`).join(', ')}. Distribua o tempo de 'study' dando prioridade às matérias de nível mais alto.

            REGRAS TÉCNICAS E DE NOMENCLATURA:
            - Tipos permitidos: 'study', 'school', 'meal', 'sleep', 'extra', 'commute', 'homework', 'reading'.
            - NUNCA sobreponha horários.
            - O Deslocamento (Ida Escola) deve terminar exatamente às 07:50.
            - O Deslocamento (Volta Escola) deve começar exatamente no horário de saída.
            - NOMES DE ATIVIDADES: Use nomes diretos. O bloco de Almoço deve se chamar apenas "Almoço" e o de Jantar apenas "Jantar". Não adicione explicações extras.
            - LACUNAS E TEMPO LIVRE: NÃO gere blocos de "Tempo Livre", "Descanso" ou "Lazer". Deixe os espaços vazios sem nenhum objeto no JSON.
            - Retorne APENAS um Array JSON de objetos: {id, day, startTime, endTime, activity, type}.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
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
            const forbiddenKeywords = ['tempo livre', 'lazer', 'descanso', 'free time', 'leisure', 'vago', 'gap', 'pós-chegada', 'ajustado'];
            const filteredData = data.filter((b: any) => 
                !forbiddenKeywords.some(keyword => b.activity.toLowerCase().includes(keyword))
            );

            const sortedData = filteredData.sort((a: any, b: any) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            setGeneratedSchedule(sortedData);
            setStep(3);
        } catch (e) {
            console.error("Erro IA:", e);
            alert("A IA teve dificuldade em conciliar todos os horários. Tente simplificar os dados.");
        } finally {
            setIsLoading(false);
        }
    };

    const exportToPNG = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(exportRef.current, { scale: 2, backgroundColor: currentThemeData.bg, useCORS: true });
            const link = document.createElement('a');
            link.download = `meu-cronograma.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) { console.error(error); } finally { setIsExporting(false); }
    };

    const renderDecoration = () => {
        const decorations: Record<string, React.ReactNode> = {
            galactic: (
                <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[150px]" />
                </div>
            ),
            cyber_study: (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                </div>
            )
        };
        return decorations[selectedTheme] || null;
    };

    const renderGrid = () => {
        const ABSOLUTE_MIN = 4 * 60; 
        const ABSOLUTE_MAX = 26 * 60;
        const wakeMinutes = timeToMinutes(routineData.normalWake);
        let sleepMinutes = timeToMinutes(routineData.normalSleep);
        if (sleepMinutes <= wakeMinutes) sleepMinutes += 1440;

        let minStart = Math.max(ABSOLUTE_MIN, wakeMinutes);
        generatedSchedule.forEach(b => {
            const s = timeToMinutes(b.startTime);
            if (s < minStart && s >= ABSOLUTE_MIN) minStart = s;
        });

        let maxEnd = Math.min(ABSOLUTE_MAX, sleepMinutes);
        generatedSchedule.forEach(b => {
            let e = timeToMinutes(b.endTime);
            if (e <= wakeMinutes) e += 1440;
            if (e > maxEnd && e <= ABSOLUTE_MAX) maxEnd = e;
        });

        const gridStart = Math.floor(minStart / 30) * 30;
        const gridEnd = Math.ceil(maxEnd / 30) * 30;
        const numSlots = Math.max(1, Math.ceil((gridEnd - gridStart) / 30));

        return (
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full border-separate border-spacing-1 min-w-[1000px] table-fixed">
                    <thead>
                        <tr>
                            <th className={`p-3 text-[10px] font-black w-24 uppercase opacity-60 ${currentThemeData.text}`}>Horário</th>
                            {DAYS.map(d => (
                                <th key={d.id} className={`p-4 text-sm font-black uppercase rounded-2xl transition-all shadow-sm ${currentThemeData.headerBg} text-white`}>
                                    {d.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: numSlots }, (_, i) => {
                            const current = (i * 30) + gridStart;
                            const h = Math.floor((current % 1440) / 60);
                            const m = current % 60;
                            const hourStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                            const slotStart = current;
                            const slotEnd = current + 30;

                            return (
                                <tr key={current} className="min-h-[45px]">
                                    <td className={`p-1.5 text-[9px] font-black rounded-xl text-center align-middle opacity-60 bg-white/5 ${currentThemeData.text}`}>{hourStr}</td>
                                    {DAYS.map(day => {
                                        const blocks = generatedSchedule.filter(b => {
                                            let s = timeToMinutes(b.startTime);
                                            let e = timeToMinutes(b.endTime);
                                            if (s < gridStart && s + 1440 < gridEnd) s += 1440;
                                            if (e < gridStart && e + 1440 < gridEnd) e += 1440;
                                            return b.day.includes(day.id) && (s < slotEnd && e > slotStart);
                                        });
                                        return (
                                            <td key={day.id} className={`p-0.5 relative rounded-xl ${currentThemeData.slotBg} border border-blue-100/10 h-[45px]`}>
                                                {blocks.map(b => (
                                                    <div key={b.id} onClick={() => setEditingBlock(b)} className={`absolute inset-0.5 z-[1] px-1.5 flex flex-col justify-center text-center overflow-hidden transition-all cursor-pointer rounded-lg hover:brightness-110 shadow-sm ${currentThemeData.blocks[b.type] || currentThemeData.blocks.study} font-black`}>
                                                        <span className="text-[8px] leading-tight uppercase truncate">{b.activity}</span>
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
    };

    if (step === 3) {
        return (
            <div id="planner-modal-overlay" className="fixed inset-0 z-[100] flex flex-col animate-fade-in transition-all duration-500 overflow-y-auto custom-scrollbar" style={{ backgroundColor: currentThemeData.bg }}>
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-white/95 backdrop-blur-3xl p-2.5 rounded-full border border-blue-100 shadow-2xl print:hidden">
                    <button onClick={() => setIsCustomizing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-50 text-blue-900 border border-blue-50">
                        <SwatchIcon className="w-4 h-4 text-blue-600" /> <span>Estilos</span>
                    </button>
                    <div className="h-4 w-px bg-gray-200 mx-0.5"></div>
                    <button onClick={() => setStep(2)} className="px-5 py-2.5 font-black bg-blue-600 text-white rounded-full hover:bg-blue-700 text-[10px] shadow-lg shadow-blue-200 uppercase tracking-widest">Ajustar</button>
                    <button onClick={onClose} className="p-2 bg-red-100/80 hover:bg-red-200 text-red-500 rounded-full transition-colors"><XIcon className="w-4 h-4"/></button>
                </div>

                <div className="flex-1 p-6 md:p-12 2xl:p-20 relative z-10 flex flex-col items-center">
                    <div id="planner-export-content" ref={exportRef} className="relative w-full max-w-[1400px]">
                        {renderDecoration()}
                        <div className={`relative ${currentThemeData.text} pt-20 md:pt-16`}>
                            <header className="mb-10 text-center">
                                <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-3 drop-shadow-sm">{currentThemeData.title}</h2>
                                <div className="flex items-center justify-center gap-4">
                                    <span className="h-px w-10 bg-current opacity-30"></span>
                                    <p className="text-[10px] font-black opacity-60 tracking-[0.3em] uppercase">{currentThemeData.name}</p>
                                    <span className="h-px w-10 bg-current opacity-30"></span>
                                </div>
                            </header>
                            <div className={`rounded-[3rem] shadow-2xl p-6 sm:p-10 ${selectedTheme === 'modern_edu' || selectedTheme === 'minimal' || selectedTheme === 'oceanic' || selectedTheme === 'garden' ? 'bg-white/60' : 'bg-black/20'} backdrop-blur-xl border border-white/10 transition-all`}>
                                {renderGrid()}
                            </div>
                        </div>
                    </div>

                    <footer className="mt-12 flex flex-wrap justify-center gap-4 print:hidden pb-16 relative z-20">
                         <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-black text-white font-black rounded-2xl hover:scale-105 transition-all text-[9px] tracking-widest uppercase shadow-xl">
                            <PrinterIcon className="w-4 h-4" /> Imprimir
                         </button>
                         <button onClick={exportToPNG} disabled={isExporting} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all text-[9px] tracking-widest uppercase shadow-xl disabled:opacity-50">
                            <PhotoIcon className="w-4 h-4" /> PNG
                         </button>
                         {onSavePlanner && (
                             <button onClick={() => onSavePlanner(generatedSchedule, selectedTheme)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-[9px] tracking-widest uppercase shadow-xl shadow-blue-300">
                                <CheckIcon className="w-4 h-4" /> {t('savePlanner')}
                             </button>
                         )}
                    </footer>
                </div>

                {isCustomizing && (
                    <div className="fixed inset-0 z-[120] flex justify-end animate-fade-in bg-black/50 backdrop-blur-md print:hidden" onClick={() => setIsCustomizing(false)}>
                        <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h4 className="font-black uppercase text-base tracking-widest text-blue-900">Galeria de Estilos</h4>
                                <button onClick={() => setIsCustomizing(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><XIcon className="w-6 h-6" /></button>
                            </header>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {(Object.keys(THEME_CONFIG) as AgendaTheme[]).map(theme => {
                                    const cfg = THEME_CONFIG[theme];
                                    const isActive = selectedTheme === theme;
                                    return (
                                        <button key={theme} onClick={() => setSelectedTheme(theme)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shadow-sm">{cfg.icon}</div>
                                            <div className="text-left flex-1"><span className="font-black text-xs uppercase tracking-widest text-blue-900 block">{cfg.name}</span></div>
                                            {isActive && <CheckIcon className="w-4 h-4 text-blue-600" />}
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
            <div className="bg-white border border-white/60 rounded-[3rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-blue-900">
                <header className="px-8 py-8 flex justify-between items-center shrink-0 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl text-white rotate-3"><AcademicCapIcon className="w-7 h-7" /></div>
                        <div><h2 className="text-xl md:text-2xl font-black tracking-tighter">Planejador Inteligente</h2><p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em]">Configuração</p></div>
                    </div>
                    <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 transition-all"><XIcon className="h-6 w-6" /></button>
                </header>

                <main className="flex-1 overflow-y-auto px-8 pb-12 pt-8 space-y-12 custom-scrollbar">
                    {step === 1 ? (
                        <div className="animate-fade-in text-center py-10 space-y-12">
                            <h3 className="text-2xl md:text-3xl font-black text-blue-900 tracking-tighter uppercase">Escolha sua estratégia</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                <button onClick={() => setStep(2)} className="p-8 rounded-[3rem] border-4 border-gray-100 bg-white hover:border-blue-600 transition-all text-left group shadow-sm hover:shadow-2xl">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ClockIcon className="w-8 h-8" /></div>
                                    <h3 className="text-xl font-black mb-2">Cronograma Semanal</h3>
                                    <p className="text-xs text-blue-700/70 font-bold leading-relaxed">Rotina fixa com horários definidos para sono, escola e estudos ativos.</p>
                                </button>
                                <div className="p-8 rounded-[3rem] border-4 border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed text-left relative overflow-hidden group">
                                    <div className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-[9px] font-black px-3 py-1 rounded-full uppercase">Em Breve</div>
                                    <div className="w-14 h-14 rounded-2xl bg-gray-200 text-gray-400 flex items-center justify-center mb-6"><SparklesIcon className="w-8 h-8" /></div>
                                    <h3 className="text-xl font-black mb-2">Ciclo de Estudos</h3>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed">Metas de horas flexíveis para rotinas imprevisíveis e foco por disciplina.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-12 max-w-2xl mx-auto pb-12 text-blue-900">
                             {/* Horários Base */}
                             <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><SunIcon className="w-5 h-5 text-yellow-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Horários da Rotina</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:gap-6 bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner">
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Acordar</label>
                                        <input type="time" value={routineData.normalWake} onChange={e => setRoutineData({...routineData, normalWake: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Dormir</label>
                                        <input type="time" value={routineData.normalSleep} onChange={e => setRoutineData({...routineData, normalSleep: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Almoço</label>
                                        <input type="time" value={routineData.lunchTime} onChange={e => setRoutineData({...routineData, lunchTime: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest block pl-1">Jantar</label>
                                        <input type="time" value={routineData.dinnerTime} onChange={e => setRoutineData({...routineData, dinnerTime: e.target.value})} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-2.5 font-black text-blue-900 outline-none shadow-sm" />
                                    </div>
                                </div>
                            </section>

                            {/* Escola e Deslocamento */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><AcademicCapIcon className="w-5 h-5 text-blue-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Escola e Transporte</h4>
                                </div>
                                <div className="bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner space-y-6">
                                    <div className="bg-white/80 p-5 rounded-3xl border border-blue-50 space-y-3 shadow-sm">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Horário do Colégio (Predefinido)</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                                <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Seg, Ter, Qui</p>
                                                <p className="text-xs font-black text-blue-900">07:50 - 16:10</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                                <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Qua, Sex</p>
                                                <p className="text-xs font-black text-blue-900">07:50 - 12:35</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-4 bg-white/40 p-5 rounded-3xl border border-white">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Deslocamento Ida (min)</label>
                                                <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">{routineData.schoolCommuteTo} min</span>
                                            </div>
                                            <input type="range" min="0" max="120" step="5" value={routineData.schoolCommuteTo} onChange={e => setRoutineData({...routineData, schoolCommuteTo: parseInt(e.target.value)})} className="w-full h-2 bg-white rounded-full appearance-none cursor-pointer accent-blue-600 shadow-inner" />
                                        </div>
                                        <div className="space-y-4 bg-white/40 p-5 rounded-3xl border border-white">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Deslocamento Volta (min)</label>
                                                <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">{routineData.schoolCommuteFrom} min</span>
                                            </div>
                                            <input type="range" min="0" max="120" step="5" value={routineData.schoolCommuteFrom} onChange={e => setRoutineData({...routineData, schoolCommuteFrom: parseInt(e.target.value)})} className="w-full h-2 bg-white rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Metas de Estudo */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><FlagIcon className="w-5 h-5 text-green-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Foco nos Estudos</h4>
                                </div>
                                <div className="bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest">Meta de Estudo Diário (extra-classe)</label>
                                            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black">{routineData.dailyStudyHours} Horas</span>
                                        </div>
                                        <input type="range" min="1" max="8" step="1" value={routineData.dailyStudyHours} onChange={e => setRoutineData({...routineData, dailyStudyHours: parseInt(e.target.value)})} className="w-full h-2.5 bg-white rounded-full appearance-none cursor-pointer accent-blue-600" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest">Tempo para Lição de Casa</label>
                                            <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black">{routineData.homeworkMinutes} min</span>
                                        </div>
                                        <input type="range" min="0" max="180" step="15" value={routineData.homeworkMinutes} onChange={e => setRoutineData({...routineData, homeworkMinutes: parseInt(e.target.value)})} className="w-full h-2.5 bg-white rounded-full appearance-none cursor-pointer accent-emerald-600" />
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

                            {/* Prioridades por Matéria */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><PencilSquareIcon className="w-5 h-5 text-indigo-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Dificuldade por Matéria</h4>
                                </div>
                                <div className="bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner space-y-4">
                                    {routineData.difficulties.map((subject) => (
                                        <div key={subject.name} className="bg-white p-4 rounded-2xl border border-blue-50 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-xs text-blue-900">{subject.name}</span>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${subject.level > 7 ? 'bg-red-100 text-red-600' : subject.level > 4 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                                    Nível {subject.level}
                                                </span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="10" step="1" 
                                                value={subject.level} 
                                                onChange={e => updateDifficulty(subject.name, parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-blue-50 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Leitura e Extras */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><PlusIcon className="w-5 h-5 text-purple-600" /></div>
                                    <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Leitura e Extras</h4>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-amber-50/30 p-6 rounded-[2.5rem] border border-amber-100 shadow-inner space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BookOpenIcon className="w-5 h-5 text-amber-600" />
                                                <span className="font-black text-xs text-amber-900 uppercase tracking-widest">Incluir Hábito de Leitura?</span>
                                            </div>
                                            <button 
                                                onClick={() => setRoutineData(p => ({...p, wantsReading: !p.wantsReading}))}
                                                className={`w-12 h-6 rounded-full transition-all relative ${routineData.wantsReading ? 'bg-amber-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${routineData.wantsReading ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        {routineData.wantsReading && (
                                            <div className="space-y-3 animate-fade-in">
                                                <div className="flex justify-between px-1">
                                                    <label className="text-[10px] font-black text-amber-600 uppercase">Minutos diários</label>
                                                    <span className="text-[10px] font-black text-amber-900">{routineData.readingDuration} min</span>
                                                </div>
                                                <input type="range" min="15" max="120" step="15" value={routineData.readingDuration} onChange={e => setRoutineData({...routineData, readingDuration: parseInt(e.target.value)})} className="w-full accent-amber-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-purple-50/30 p-6 md:p-8 rounded-[2.5rem] border border-purple-100 shadow-inner space-y-6">
                                        <div className="bg-white p-5 rounded-[2rem] border border-purple-50 space-y-4">
                                            <input placeholder="Ex: Natação, Inglês..." value={newExtra.name} onChange={e => setNewExtra({...newExtra, name: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none font-black text-sm placeholder:text-gray-300" />
                                            <div className="flex gap-2">
                                                {DAYS.map(d => (
                                                    <button key={d.id} onClick={() => setNewExtra(p => ({...p, days: p.days.includes(d.id) ? p.days.filter(i => i !== d.id) : [...p.days, d.id]}))} className={`flex-1 py-2 rounded-xl text-[8px] font-black border-2 ${newExtra.days.includes(d.id) ? 'bg-purple-600 text-white' : 'bg-white text-purple-200'}`}>{d.label}</button>
                                                ))}
                                            </div>
                                            <button onClick={addExtraActivity} className="w-full py-3 bg-purple-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-purple-100">Adicionar Extra</button>
                                        </div>
                                        {routineData.extraActivities.map(a => (
                                            <div key={a.id} className="flex items-center justify-between bg-white/80 p-3 rounded-2xl border border-purple-50"><span className="font-black text-[10px] truncate">{a.name}</span><button onClick={() => setRoutineData(p => ({...p, extraActivities: p.extraActivities.filter(i => i.id !== a.id)}))} className="p-2 text-red-300 hover:text-red-500 transition-all"><TrashIcon className="w-4 h-4"/></button></div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <div className="pt-6">
                                <button onClick={generatePlanner} disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest border-b-6 border-blue-800 disabled:opacity-50">
                                    {isLoading ? 'A IA está organizando seu tempo...' : <><SparklesIcon className="w-6 h-6" /> Gerar Cronograma</>}
                                </button>
                                <button onClick={() => setStep(1)} className="w-full text-center text-[10px] font-black uppercase text-blue-300 tracking-widest hover:text-blue-600 mt-6 transition-colors">Voltar</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudyPlanner;
