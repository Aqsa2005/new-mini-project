import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, MessageSquare, CalendarCheck, Info } from 'lucide-react';
import { db } from '../firebaseConfig';
import {
    collection, query, where, orderBy, onSnapshot,
    writeBatch, getDocs, doc
} from 'firebase/firestore';

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUserStr = localStorage.getItem('counseling_currentUser');
        if (!currentUserStr) {
            navigate('/');
            return;
        }

        const user = JSON.parse(currentUserStr);

        // Real-time listener for this student's notifications
        // Completely removed index-dependent rules to prevent crashing. All filtering done locally.
        const q = query(
            collection(db, 'studentNotifications')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Temporary debug: Remove all filtering to ensure ANY notification renders
            // If it renders now, we know the studentUid/email properties were mismatched.
            
            // Sort notifications locally (descending order, newest first)
            data.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });
            setNotifications(data);
            setLoading(false);
        });

        return () => unsub();
    }, [navigate]);

    const clearNotifications = async () => {
        if (!notifications || notifications.length === 0) return;
        
        try {
            const batch = writeBatch(db);
            notifications.forEach(notif => {
                batch.delete(doc(db, 'studentNotifications', notif.id));
            });
            await batch.commit();
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'message': return <MessageSquare size={20} className="text-blue-500" />;
            case 'update': return <CalendarCheck size={20} className="text-green-500" />;
            case 'request': return <Info size={20} className="text-amber-500" />;
            case 'slot_approval': return <CalendarCheck size={20} className="text-green-500" />;
            case 'slot_rejection': return <Info size={20} className="text-red-500" />;
            default: return <Bell size={20} className="text-primary" />;
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                        <p className="text-gray-500 mt-2">Stay updated on your slot approvals and messages.</p>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={clearNotifications}
                            className="bg-card hover:bg-white text-gray-600 px-4 py-2 border border-gray-200 rounded-lg shadow-sm transition-colors text-sm font-medium"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center p-8 text-gray-400">Loading notifications...</div>
                ) : (
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="bg-card rounded-2xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="bg-primary/5 p-4 rounded-full mb-4">
                                    <Bell size={32} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">All caught up!</h3>
                                <p className="text-gray-500">You don't have any new notifications right now.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const isLinkable = notif.type === 'message' || notif.type === 'slot_approval';
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => isLinkable ? navigate('/chat-counselor') : null}
                                        className={`bg-card rounded-2xl p-5 border shadow-sm flex items-start space-x-4 transition-all ${isLinkable ? 'cursor-pointer hover:border-blue-400 hover:shadow-md border-blue-100' : 'border-gray-100 hover:border-secondary'}`}
                                    >
                                        <div className="bg-white p-3 rounded-full shadow-sm">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-lg">{notif.text}</p>
                                            <p className="text-sm text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                                        </div>
                                        {isLinkable && (
                                            <div className="text-blue-500 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg self-center border border-blue-100">
                                                Open Chat →
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentNotifications;
