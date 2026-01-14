
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SparklesIcon, XIcon, PaperAirplaneIcon, AppLogoIcon } from './icons';
import { useLanguage } from '../languageContext';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
        try {
            // Using a named parameter as required by the library.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Corrected model name based on task type: Basic Text Tasks use 'gemini-3-flash-preview'.
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: "You are a friendly and helpful AI study assistant for the 'Matéria para Você' learning platform. You act as a tutor, helping students understand concepts, summarizing topics, and answering questions about their courses. Keep your responses concise, encouraging, and formatted with Markdown where appropriate. If asked about the platform, explain you are an AI assistant integrated to help them learn.",
                }
            });
            // Add initial welcome message locally
            setMessages([{ role: 'model', text: t('welcomeAI') }]);
        } catch (error) {
            console.error("Failed to initialize AI", error);
        }
    }
  }, [isOpen, t]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
        // chatSession.sendMessage correctly receives the message parameter.
        const result = await chatSessionRef.current.sendMessage({ message: userMessage });
        // result.text is used as a property access, which is the correct method for Extracting Text Output.
        setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error) {
        console.error("AI Error", error);
        setMessages(prev => [...prev, { role: 'model', text: t('errorOccurred') }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        {!isOpen && (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                aria-label={t('aiAssistant')}
            >
                <SparklesIcon className="w-6 h-6 animate-pulse" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-blue-900 px-2 py-1 rounded-md text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    {t('aiAssistant')}
                </span>
            </button>
        )}

        {isOpen && (
            <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        <h3 className="font-bold">{t('aiAssistant')}</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-blue-100 text-blue-900 rounded-bl-none shadow-sm'
                            }`}>
                                {/* Simple text rendering, in real app might use a markdown renderer */}
                                {msg.text.split('\n').map((line, i) => (
                                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-blue-100 text-blue-900 rounded-2xl rounded-bl-none shadow-sm p-3 flex gap-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-blue-100 shrink-0 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('askAnything')}
                        className="flex-1 bg-blue-50 text-blue-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-100"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        )}
    </>
  );
};

export default AIChat;
