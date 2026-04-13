/**
 * ChatBot — Scripted + Simple LLM Agent with Voice.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiVolume2, FiVolumeX, FiUser } from 'react-icons/fi';
import { chatAPI } from '../services/api';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [language, setLanguage] = useState('english'); // 'english' or 'hindi'
    const chatEndRef = useRef(null);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                text: language === 'english' ? 'How can I help you?' : 'मैं आपकी कैसे मदद कर सकता हूँ?',
                isGreeting: true
            }]);
        }
    }, [language]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const speak = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        const hindiVoice = voices.find(v => v.lang.includes('hi'));
        if (hindiVoice && (text.match(/[\u0900-\u097F]/))) {
            utterance.voice = hindiVoice;
        }

        window.speechSynthesis.speak(utterance);
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'english' ? 'hindi' : 'english');
        setMessages([]); // Reset chat to load new initial greeting
    };

    const handleQuickAction = (type) => {
        if (type === 'contact') {
            const reply = language === 'english' 
                ? "You can reach us at contact@voyageai.com or call +1-800-VOYAGE."
                : "आप हमसे contact@voyageai.com पर संपर्क कर सकते हैं या +1-800-VOYAGE पर कॉल कर सकते हैं।";
            setMessages(prev => [...prev, { role: 'user', text: language === 'english' ? 'Contact info' : 'संपर्क जानकारी' }, { role: 'assistant', text: reply }]);
            speak(reply);
        } else if (type === 'how_to_use') {
            const reply = language === 'english'
                ? "Go to the 'Explore' page to see destinations. Use the 'Plan Trip' page to generate AI itineraries. It's that simple!"
                : "'Explore' पृष्ठ पर जाएं। AI यात्रा कार्यक्रम बनाने के लिए 'Plan Trip' का उपयोग करें। यह बहुत आसान है!";
            setMessages(prev => [...prev, { role: 'user', text: language === 'english' ? 'How to use this portal' : 'इस पोर्टल का उपयोग कैसे करें' }, { role: 'assistant', text: reply }]);
            speak(reply);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await chatAPI.sendMessage({ message: userMsg, language });
            const aiMsg = res.data.response;
            setMessages(prev => [...prev, { role: 'assistant', text: aiMsg }]);
            speak(aiMsg);
        } catch (err) {
            const errorMsg = language === 'english' ? 'Something went wrong. Please try again.' : 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।';
            setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-6 w-[350px] md:w-[400px] h-[550px] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                    <FiUser size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Navigator</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                                    title={isMuted ? "Unmute Bot" : "Mute Bot"}
                                >
                                    {isMuted ? <FiVolumeX /> : <FiVolume2 />}
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <FiX />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed relative ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-slate-100 text-slate-800 rounded-tl-none shadow-sm font-medium'
                                    }`}>
                                        {msg.text}

                                        {msg.role === 'assistant' && (
                                            <button 
                                                onClick={() => speak(msg.text)}
                                                className="absolute -right-6 top-2 text-slate-400 hover:text-indigo-600"
                                                title="Speak this phrase"
                                            >
                                                <FiVolume2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons for Initial Greeting */}
                                    {msg.isGreeting && (
                                        <div className="flex flex-col gap-2 mt-4 w-full">
                                            <button 
                                                onClick={() => handleQuickAction('contact')}
                                                className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm"
                                            >
                                                {language === 'english' ? 'Contact Info' : 'संपर्क जानकारी'}
                                            </button>
                                            <button 
                                                onClick={() => handleQuickAction('how_to_use')}
                                                className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm"
                                            >
                                                {language === 'english' ? 'Click here to know how to use this portal' : 'इस पोर्टल का उपयोग कैसे करें यहां क्लिक करें'}
                                            </button>
                                            <button 
                                                onClick={toggleLanguage}
                                                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm mt-2"
                                            >
                                                {language === 'english' ? 'Change Language: Hindi (हिंदी)' : 'Change Language: English'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Footer / Input */}
                        <form onSubmit={handleSend} className="p-6 pt-0">
                            <div className="relative group">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={language === 'english' ? "Type to ask AI..." : "पूछने के लिए टाइप करें..."}
                                    className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                />
                                <button 
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                >
                                    <FiSend />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            {!isOpen && (
               <motion.button
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   whileHover={{ scale: 1.1, rotate: 5 }}
                   onClick={() => setIsOpen(true)}
                   className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center group relative overflow-hidden"
               >
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/50 to-transparent scale-0 group-hover:scale-100 transition-transform duration-500" />
                   <FiMessageSquare size={24} className="relative z-10" />
                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
               </motion.button>
            )}
        </div>
    );
};

export default ChatBot;
