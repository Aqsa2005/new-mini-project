import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CounselorSidebar from '../components/CounselorSidebar';
import { Bell, MessageSquare, CalendarCheck, Info } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const loadNotifications = () => {
        const stored = localStorage.getItem('counselor_notifications');
        if (stored) {
            // Sort by most recent
            const parsed = JSON.parse(stored).sort((a, b) => b.id - a.id);
            setNotifications(parsed);
        } else {
            // Add some initial mock notifications
            const initial = [
                { id: Date.now() - 3600000, text: "Current Student (Demo) requested counseling", type: "request" },
                { id: Date.now() - 7200000, text: "Sarah Williams booked a slot for tomorrow at 10:00 AM", type: "slot" }
            ];
            setNotifications(initial);
            localStorage.setItem('counselor_notifications', JSON.stringify(initial));
        }
    };

    useEffect(() => {
        loadNotifications();

        const handleStorage = (e) => {
            if (e.key === 'counselor_notifications') {
                loadNotifications();
            }
        };
        window.addEventListener('storage', handleStorage);
        
        // Polling to keep it synced
        const interval = setInterval(() => {
             const current = localStorage.getItem('counselor_notifications');
             if (current) {
                 const parsed = JSON.parse(current).sort((a, b) => b.id - a.id);
                 setNotifications(prev => {
                     if (parsed.length !== prev.length) return parsed;
                     return prev;
                 });
             }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
        localStorage.removeItem('counselor_notifications');
    };

    const getIcon = (type) => {
        switch(type) {
            case 'message': return <MessageSquare size={20} className="text-blue-500" />;
            case 'slot': return <CalendarCheck size={20} className="text-green-500" />;
            case 'request': return <Info size={20} className="text-amber-500" />;
            default: return <Bell size={20} className="text-primary" />;
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <CounselorSidebar />
            <main className="flex-1 ml-64 p-8 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                        <p className="text-gray-500 mt-2">Stay updated on student requests and messages.</p>
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

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-card rounded-2xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="bg-primary/5 p-4 rounded-full mb-4">
                                <Bell size={32} className="text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">All caught up!</h3>
                            <p className="text-gray-500">You don't have any new notifications.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const isMessage = notif.type === 'message';
                            return (
                            <div 
                                key={notif.id} 
                                onClick={() => isMessage ? navigate('/counselor-chat') : null}
                                className={`bg-card rounded-2xl p-5 border shadow-sm flex items-start space-x-4 transition-all ${isMessage ? 'cursor-pointer hover:border-blue-400 hover:shadow-md border-blue-100' : 'border-gray-100 hover:border-secondary'}`}
                            >
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-lg">{notif.text}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(notif.id).toLocaleString()}
                                    </p>
                                </div>
                                {isMessage && (
                                    <div className="text-blue-500 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg self-center border border-blue-100">
                                        Open Chat →
                                    </div>
                                )}
                            </div>
                        )})
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
