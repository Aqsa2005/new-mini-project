import React, { useState, useRef, useEffect } from 'react';
import { Send, UserRound, ArrowLeft, Calendar, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import {
    collection, addDoc, query, orderBy, updateDoc,
    onSnapshot, serverTimestamp, doc, setDoc, getDoc
} from 'firebase/firestore';

const formatTimestamp = (ts) => {
    if (!ts) return new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (ts.toDate) return ts.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (typeof ts === 'string' || typeof ts === 'number') return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const initializingChats = new Set();

const ChatCounselor = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatMetadata, setChatMetadata] = useState(null);
    const [slots, setSlots] = useState([]);
    const [showSlotsModal, setShowSlotsModal] = useState(false);
    const [isChatActive, setIsChatActive] = useState(false);
    const messagesEndRef = useRef(null);

    const user = auth.currentUser;
    // Chat room ID is based on the student's UID
    const chatId = user?.uid || 'unknown';

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    // ── Ensure chat room doc exists, then listen to messages ──
    useEffect(() => {
        if (!user) return;

        const ensureChatRoom = async () => {
            if (initializingChats.has(chatId)) return;
            initializingChats.add(chatId);
            
            const chatRef = doc(db, 'counselorChats', chatId);
            const snap = await getDoc(chatRef);
            if (!snap.exists()) {
                // Create chat room with welcome message
                await setDoc(chatRef, {
                    studentId: user.uid,
                    studentEmail: user.email,
                    createdAt: serverTimestamp()
                });
                // Add welcome message from counselor
                await addDoc(collection(db, 'counselorChats', chatId, 'messages'), {
                    text: "Send me a message. You can check if there are any slots available and click ‘Select Slot’ or wait for me to add.",
                    sender: 'counselor',
                    createdAt: serverTimestamp()
                });
            }
        };

        ensureChatRoom();

        // Real-time listener
        const q = query(
            collection(db, 'counselorChats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const unsub = onSnapshot(q, (snapshot) => {
            let msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Fix: Re-sort to force pending messages (null timestamp) to the bottom
            msgs.sort((a, b) => {
                const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now() + 100000;
                const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now() + 100000;
                return tA - tB;
            });

            // Filter out duplicated welcome messages
            const uniqueMsgs = msgs.filter((msg, idx, arr) => {
                if (idx === 0) return true;
                const prev = arr[idx - 1];
                return !(msg.text === prev.text && msg.sender === prev.sender && msg.text.includes("wait for me to add"));
            });

            setMessages(uniqueMsgs);
            setLoading(false);
        });

        // Listener for Chat Metadata
        const chatUnsub = onSnapshot(doc(db, 'counselorChats', chatId), (docSnap) => {
            if (docSnap.exists()) {
                setChatMetadata(docSnap.data());
            }
        });
        
        // Listener for Slots
        const slotsUnsub = onSnapshot(collection(db, 'counselorSlots'), (snapshot) => {
            setSlots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsub();
            chatUnsub();
            slotsUnsub();
        };
    }, [chatId]);

    const studentMessageCount = messages.filter(m => m.sender === 'student').length;
    const isSlotApproved = chatMetadata?.slotStatus === 'approved' && chatMetadata?.approvedSlot;
    
    // Check if current time is within slot time
    const checkSlotActive = () => {
        if (!isSlotApproved) return false;
        try {
            const now = new Date();
            // Parse slot date and time properly into a JS Date object
            // Format check: "YYYY-MM-DD" and "HH:MM"
            const slotDate = new Date(`${chatMetadata.approvedSlot.date}T${chatMetadata.approvedSlot.time}`);
            const ONE_HOUR = 60 * 60 * 1000;
            // chat is active if now is between slotDate and slotDate + 1 hour
            return now >= slotDate && now <= new Date(slotDate.getTime() + ONE_HOUR);
        } catch (e) {
            return false;
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIsChatActive(checkSlotActive());
        }, 10000); // Check every 10 seconds
        setIsChatActive(checkSlotActive());
        return () => clearInterval(interval);
    }, [chatMetadata]);

    const canChat = isSlotApproved ? isChatActive : studentMessageCount < 1;

    const handleSelectSlot = async (slot) => {
        await updateDoc(doc(db, 'counselorChats', chatId), {
            requestedSlot: slot,
            slotStatus: 'requested'
        });
        
        await addDoc(collection(db, 'counselorNotifications'), {
            text: `Student (${user.email}) requested a chat slot for ${slot.date} at ${slot.time}`,
            type: 'slot_request',
            chatId,
            studentEmail: user.email,
            read: false,
            createdAt: serverTimestamp()
        });
        
        setShowSlotsModal(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const text = input;
        setInput('');

        // Save student message
        await addDoc(collection(db, 'counselorChats', chatId, 'messages'), {
            text,
            sender: 'student',
            senderEmail: user.email,
            createdAt: serverTimestamp()
        });

        // Update chat room metadata to alert counselor
        await updateDoc(doc(db, 'counselorChats', chatId), {
            lastSenderRole: 'student',
            lastMessage: text,
            lastMessageAt: serverTimestamp()
        }).catch(() => {});

        // Create notification for counselor in Firestore
        await addDoc(collection(db, 'counselorNotifications'), {
            text: `New message from student (${user.email})`,
            type: 'message',
            chatId,
            studentEmail: user.email,
            read: false,
            createdAt: serverTimestamp()
        });
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
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => setShowSlotsModal(true)}
                        className="flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
                    >
                        <Calendar size={18} />
                        <span className="font-medium text-sm">Select Slot</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 overflow-y-auto max-w-4xl w-full mx-auto" style={{ height: 'calc(100vh - 140px)' }}>
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-400">Loading messages...</div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex flex-col ${message.sender === 'student' ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs text-gray-400 mb-1 ml-1 mr-1">
                                    {message.sender === 'student' ? 'You' : 'Counselor'}
                                </span>
                                <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${message.sender === 'student'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-card border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                    <p className="text-[15px] leading-relaxed">{message.text}</p>
                                    <span className={`text-[10px] block mt-1 ${message.sender === 'student' ? 'text-blue-100 text-right' : 'text-gray-400 text-left'}`}>
                                        {formatTimestamp(message.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            <footer className="bg-card border-t border-gray-100 p-4 sticky bottom-0">
                {!canChat && (
                    <div className="max-w-4xl mx-auto mb-3 text-center text-sm font-medium text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center justify-center space-x-2">
                        <Clock size={16} />
                        <span>
                            {isSlotApproved 
                                ? `Chat will be available on ${chatMetadata.approvedSlot.date} at ${chatMetadata.approvedSlot.time} for 1 hour.` 
                                : `You must wait for counselor approval before sending more messages.`}
                        </span>
                    </div>
                )}
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!canChat}
                        placeholder={canChat ? "Message your counselor..." : "Chat restricted..."}
                        className="flex-1 bg-background border border-gray-200 text-gray-800 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-[15px] disabled:opacity-60 disabled:bg-gray-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !canChat}
                        className="bg-primary text-white p-3 rounded-full hover:bg-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20 flex-shrink-0"
                    >
                        <Send size={20} className="ml-1" />
                    </button>
                </form>
            </footer>

            {/* Slots Modal */}
            {showSlotsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-gray-800">Available Slots</h3>
                            <button onClick={() => setShowSlotsModal(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            {chatMetadata?.slotStatus === 'requested' && chatMetadata?.requestedSlot && (
                                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100 mb-4">
                                    You have requested a slot on <strong>{chatMetadata.requestedSlot.date}</strong> at <strong>{chatMetadata.requestedSlot.time}</strong>. Waiting for counselor approval.
                                </div>
                            )}
                            
                            {chatMetadata?.slotStatus === 'approved' && chatMetadata?.approvedSlot && (
                                <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm border border-green-100 mb-4">
                                    Your approved slot is on <strong>{chatMetadata.approvedSlot.date}</strong> at <strong>{chatMetadata.approvedSlot.time}</strong>.
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {slots.length === 0 ? (
                                <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    No slots available at the moment.
                                </div>
                            ) : (
                                slots.map(slot => (
                                    <div key={slot.id} className="flex items-center justify-between p-4 bg-background border border-gray-100 rounded-xl hover:border-primary/30 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{slot.date}</p>
                                                <p className="text-sm text-gray-500">{slot.time}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSelectSlot(slot)}
                                            className="text-primary font-medium text-sm bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
                                        >
                                            Request
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatCounselor;
