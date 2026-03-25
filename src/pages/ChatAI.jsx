import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// ADDED CODE - CONTEXT AWARE BOT LOGIC
function getBotReply(message, context) {
    const msg = message.toLowerCase();

    // STEP 1: HANDLE FOLLOW-UP CONTEXT
    const isUnsure = msg.includes("don't know") || msg.includes("dont know") || msg.includes("not sure") || msg.includes("no idea");

    if (context === "asked_positive_reason") {
        if (isUnsure) {
            return {
                reply: "Anyway, I'm so happy to hear that you are happy! Keep smiling 😊",
                nextContext: null
            };
        }
        return {
            reply: "That's wonderful! You should be proud of yourself 😊",
            nextContext: null
        };
    }

    if (context === "asked_negative_reason") {
        if (isUnsure) {
            return {
                reply: "It's totally okay not to know. Sometimes feelings are just confusing. Just remember I'm here for you and you're not alone ❤️",
                nextContext: null
            };
        }
        return {
            reply: "That sounds really tough. I'm here for you. Want to share more?",
            nextContext: "continue_support"
        };
    }

    if (context === "continue_support") {
        return {
            reply: "You're not alone. Talking about it can really help. I'm here with you ❤️",
            nextContext: null
        };
    }

    if (context === "asked_study_help") {
        return {
            reply: "Try using small study sessions with breaks. I can help you plan if you want 📚",
            nextContext: null
        };
    }

    // STEP 2: NORMAL RULES
    if (msg.includes("not good") || msg.includes("not happy") || msg.includes("unhappy") ||
        msg.includes("bad day") || msg.includes("sad") || msg.includes("lonely") ||
        msg.includes("depressed") || msg.includes("worthless") || msg.includes("broken") ||
        msg.includes("alone") || msg.includes("crying") || msg.includes("unwell") || msg.includes("not bad")) {
        return {
            reply: "I'm really sorry you're feeling this way. Do you want to talk about what's bothering you?",
            nextContext: "asked_negative_reason"
        };
    }

    if (msg.includes("stress") || msg.includes("worried") || msg.includes("tired") ||
        msg.includes("anxious") || msg.includes("pressure") || msg.includes("confused") ||
        msg.includes("upset")) {
        return {
            reply: "It sounds like you're feeling overwhelmed. Do you want to tell me more?",
            nextContext: "asked_negative_reason"
        };
    }

    if (msg.includes("happy") || msg.includes("good") || msg.includes("great") ||
        msg.includes("excited") || msg.includes("relieved") || msg.includes("fine") ||
        msg.includes("okay")) {
        return {
            reply: "That's really nice to hear! What made you feel this way?",
            nextContext: "asked_positive_reason"
        };
    }

    if (msg.includes("exam") || msg.includes("study") || msg.includes("marks")) {
        return {
            reply: "Studies can feel stressful sometimes. Do you want help managing it?",
            nextContext: "asked_study_help"
        };
    }

    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
        return {
            reply: "Hi! How are you feeling today?",
            nextContext: null
        };
    }

    if (msg.includes("thank you") || msg.includes("thanks") || msg.includes("grateful") || msg.includes("appreciate")) {
        return {
            reply: "You're very welcome! I will always be there for you.",
            nextContext: null
        };
    }

    // LONG MESSAGE SUPPORT
    if (msg.split(" ").length > 8) {
        return {
            reply: "Thank you for sharing that. I'm here to listen. Tell me more if you'd like.",
            nextContext: null
        };
    }

    return {
        reply: "I'm not sure I understood that. Can you explain a bit more?",
        nextContext: null
    };
}

const ChatAI = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI mental health assistant. How are you feeling today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [context, setContext] = useState(null); // ADDED: context state
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);

        // Compute bot response with current context
        const botResponse = getBotReply(input, context);

        // Update context for the next interaction
        setContext(botResponse.nextContext);
        setInput('');

        // Simulate AI response delay
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse.reply, sender: 'ai' }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card border-b border-gray-100 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">AI Assistant</h1>
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
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${message.sender === 'user'
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
                        placeholder="Type your message..."
                        className="flex-1 bg-background border border-gray-200 text-gray-800 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-all text-[15px]"
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

export default ChatAI;
