import React, { useState, useRef, useEffect } from 'react';
import { Send, Info, X } from 'lucide-react';

const ChatInterface = ({ student }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const messagesEndRef = useRef(null);

    const getAllChats = () => JSON.parse(localStorage.getItem('counseling_all_chats') || '{}');
    const saveAllChats = (chats) => localStorage.setItem('counseling_all_chats', JSON.stringify(chats));

    const loadMessages = () => {
        const chats = getAllChats();
        if (chats[student.id]) {
            setMessages(chats[student.id]);
        } else {
            const initial = [{ id: Date.now(), text: `Hello ${student.name}, how can I help you today?`, sender: 'counselor' }];
            setMessages(initial);
            chats[student.id] = initial;
            saveAllChats(chats);
        }
    };

    useEffect(() => {
        loadMessages();

        const handleStorage = (e) => {
            if (e.key === 'counseling_all_chats') {
                const chats = JSON.parse(e.newValue || '{}');
                setMessages(chats[student.id] || []);
            }
        };
        window.addEventListener('storage', handleStorage);
        
        const interval = setInterval(() => {
             const chats = getAllChats();
             setMessages(prev => {
                 const current = chats[student.id] || [];
                 if (current.length !== prev.length) return current;
                 return prev;
             });
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [student.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (user, messageText) => {
        const newMsg = { id: Date.now(), text: messageText, sender: 'counselor' };
        
        const chats = getAllChats();
        const userChat = chats[user.id] || [];
        chats[user.id] = [...userChat, newMsg];
        saveAllChats(chats);
        setMessages(chats[user.id]);
        
        // Save notification for student
        const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
        notifications.push({ id: Date.now(), text: 'New message from counselor', type: 'message' });
        localStorage.setItem('student_notifications', JSON.stringify(notifications));
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(student, input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] bg-background rounded-2xl overflow-hidden border border-gray-200/50 shadow-inner">
            {/* Top Bar */}
            <div className="bg-card p-4 border-b border-gray-200/50 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="font-bold text-gray-800">{student.name}</h2>
                    <p className="text-xs text-green-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online
                    </p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="p-2 text-primary hover:bg-secondary/30 rounded-full transition-colors"
                >
                    <Info size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-card/40">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.sender === 'counselor' ? 'items-end' : 'items-start'}`}
                        >
                            <span className="text-xs text-gray-400 mb-1 ml-1 mr-1">
                                {message.sender === 'counselor' ? 'You' : student.name}
                            </span>
                            <div
                                className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${message.sender === 'counselor'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-card border border-gray-200 text-gray-800 rounded-bl-sm'
                                    }`}
                            >
                                <p className="text-[14px] leading-relaxed">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-card p-3 border-t border-gray-200/50">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-background border border-gray-200 text-gray-800 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-[14px]"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-primary text-white p-2.5 rounded-full hover:bg-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </form>
            </div>

            {/* Info Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-gray-800">Student Details</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-background rounded-xl p-3 border border-gray-100">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</span>
                                <p className="font-medium text-gray-800 text-lg mt-1">{student.name}</p>
                            </div>
                            <div className="bg-background rounded-xl p-3 border border-gray-100">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">College ID</span>
                                <p className="font-medium text-gray-800 mt-1">{student.collegeId}</p>
                            </div>
                            <div className="bg-background rounded-xl p-3 border border-gray-100">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Batch</span>
                                <p className="font-medium text-gray-800 mt-1">{student.batch}</p>
                            </div>
                            <div className="bg-background rounded-xl p-3 border border-gray-100">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Class</span>
                                <p className="font-medium text-gray-800 mt-1">{student.studentClass}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
