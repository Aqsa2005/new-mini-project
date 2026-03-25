import React, { useState, useRef, useEffect } from 'react';
import { Send, UserRound, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatCounselor = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    
    // We use ID '1' to sync with the mock list in Counselor portal for demo
    const studentId = '1';

    const getAllChats = () => JSON.parse(localStorage.getItem('counseling_all_chats') || '{}');
    const saveAllChats = (chats) => localStorage.setItem('counseling_all_chats', JSON.stringify(chats));

    const loadMessages = () => {
        const chats = getAllChats();
        if (chats[studentId]) {
            setMessages(chats[studentId]);
        } else {
            const initial = [{ id: Date.now(), text: "Hello! I'm your assigned counselor. How can I support you today?", sender: 'counselor' }];
            setMessages(initial);
            chats[studentId] = initial;
            saveAllChats(chats);
        }
    };

    useEffect(() => {
        loadMessages();

        const handleStorage = (e) => {
            if (e.key === 'counseling_all_chats') {
                const chats = JSON.parse(e.newValue || '{}');
                setMessages(chats[studentId] || []);
            }
        };
        window.addEventListener('storage', handleStorage);
        
        const interval = setInterval(() => {
             const chats = getAllChats();
             setMessages(prev => {
                 const current = chats[studentId] || [];
                 if (current.length !== prev.length) return current;
                 return prev;
             });
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (user, messageText) => {
        const newMsg = { id: Date.now(), text: messageText, sender: 'student' };
        const chats = getAllChats();
        const userChat = chats[user] || [];
        chats[user] = [...userChat, newMsg];
        
        saveAllChats(chats);
        setMessages(chats[user]);

        // Notify counselor
        const notifications = JSON.parse(localStorage.getItem('counselor_notifications') || '[]');
        notifications.push({ id: Date.now(), text: 'New message from student', type: 'message' });
        localStorage.setItem('counselor_notifications', JSON.stringify(notifications));
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(studentId, input);
        setInput('');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card border-b border-gray-100 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary/20 text-primary p-2 rounded-full">
                            <UserRound size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">College Counselor</h1>
                            <p className="text-xs text-green-500 font-medium flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 overflow-y-auto max-w-4xl w-full mx-auto" style={{ height: 'calc(100vh - 140px)' }}>
                <div className="space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.sender === 'student' ? 'items-end' : 'items-start'}`}
                        >
                            <span className="text-xs text-gray-400 mb-1 ml-1 mr-1">
                                {message.sender === 'student' ? 'You' : 'Counselor'}
                            </span>
                            <div
                                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${message.sender === 'student'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-card border border-gray-100 text-gray-800 rounded-bl-sm'
                                    }`}
                            >
                                <p className="text-[15px] leading-relaxed">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="bg-card border-t border-gray-100 p-4 sticky bottom-0">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message your counselor..."
                        className="flex-1 bg-background border border-gray-200 text-gray-800 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-[15px]"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-primary text-white p-3 rounded-full hover:bg-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20 flex-shrink-0"
                    >
                        <Send size={20} className="ml-1" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatCounselor;
