import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar as CalendarIcon, Clock, Check, XCircle } from 'lucide-react';

const SlotCalendar = () => {
    const [slots, setSlots] = useState([]);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [rejectionRemark, setRejectionRemark] = useState({});

    useEffect(() => {
        loadSlots();
        const handleStorage = (e) => {
            if (e.key === 'counselor_slots') {
                loadSlots();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const loadSlots = () => {
        const stored = localStorage.getItem('counselor_slots');
        if (stored) setSlots(JSON.parse(stored));
    };

    const saveSlots = (newSlots) => {
        setSlots(newSlots);
        localStorage.setItem('counselor_slots', JSON.stringify(newSlots));
    };

    const handleAddSlot = (e) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) return;

        if (startTime >= endTime) {
            alert("End time must be after start time");
            return;
        }

        const newSlot = {
            id: Date.now().toString(),
            date,
            startTime,
            endTime,
            isBooked: false,
            status: 'available',
            bookedBy: null,
            remark: ''
        };

        const updated = [...slots, newSlot].sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });
        
        saveSlots(updated);
        
        setStartTime('');
        setEndTime('');
    };

    const handleRemoveSlot = (id) => {
        const updated = slots.filter(slot => slot.id !== id);
        saveSlots(updated);
    };

    const handleApproveSlot = (id) => {
        const updated = slots.map(s => {
            if (s.id === id) {
                return { ...s, status: 'confirmed' };
            }
            return s;
        });
        saveSlots(updated);

        // Notify Student
        const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
        notifications.push({ id: Date.now(), text: 'Your slot booking has been confirmed ✅', type: 'update' });
        localStorage.setItem('student_notifications', JSON.stringify(notifications));
    };

    const handleRejectSlot = (id) => {
        const remark = rejectionRemark[id] || 'No reason provided';
        const updated = slots.map(s => {
            if (s.id === id) {
                return { ...s, status: 'rejected', remark };
            }
            return s;
        });
        saveSlots(updated);

        // Notify Student
        const notifications = JSON.parse(localStorage.getItem('student_notifications') || '[]');
        notifications.push({ id: Date.now(), text: `Your slot booking was rejected.`, type: 'update' });
        localStorage.setItem('student_notifications', JSON.stringify(notifications));
        
        setRejectionRemark(prev => ({ ...prev, [id]: '' }));
    };

    const updateRemark = (id, text) => {
        setRejectionRemark(prev => ({ ...prev, [id]: text }));
    };

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div>
            {/* Add Slot Form */}
            <form onSubmit={handleAddSlot} className="bg-background rounded-xl p-4 mb-6 border border-gray-200 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                    <div className="relative">
                        <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="date" 
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Time</label>
                    <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="time" 
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Time</label>
                    <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="time" 
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="bg-primary text-white hover:bg-secondary hover:text-primary px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium h-[42px]"
                >
                    <Plus size={18} /> Add Slot
                </button>
            </form>

            {/* Slots List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-4 font-semibold text-gray-600 border-b border-gray-100 bg-gray-50/50">
                    <div>Date</div>
                    <div>Time</div>
                    <div>Status</div>
                    <div>Student</div>
                    <div className="text-right">Action</div>
                </div>
                
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                    {slots.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No availability slots created yet. Add one above.
                        </div>
                    ) : (
                        slots.map(slot => {
                            const status = slot.status || (slot.isBooked ? 'booked' : 'available');
                            return (
                            <div key={slot.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                <div className="grid grid-cols-5 gap-4 items-center">
                                    <div className="font-medium text-gray-800">
                                        {formatDate(slot.date)}
                                    </div>
                                    <div className="text-gray-600">
                                        {slot.startTime} – {slot.endTime}
                                    </div>
                                    <div>
                                        {status === 'available' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Available</span>}
                                        {status === 'booked' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>}
                                        {status === 'confirmed' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>}
                                        {status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        {slot.bookedBy || '-'}
                                    </div>
                                    <div className="text-right flex items-center justify-end gap-2">
                                        {status === 'available' && (
                                            <button 
                                                onClick={() => handleRemoveSlot(slot.id)}
                                                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Remove slot"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                        {status === 'booked' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApproveSlot(slot.id)}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 p-1.5 rounded-lg transition-colors flex items-center justify-center font-bold"
                                                    title="Approve Slot"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectSlot(slot.id)}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 p-1.5 rounded-lg transition-colors flex items-center justify-center font-bold"
                                                    title="Reject Slot"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                        {status === 'confirmed' || status === 'rejected' ? (
                                            <span className="text-xs text-gray-400 italic">No action</span>
                                        ) : null}
                                    </div>
                                </div>
                                
                                {/* Slot Reject Remark Input - visible only if status is booked, underneath the main row */}
                                {status === 'booked' && (
                                    <div className="mt-3 pl-2 border-l-2 border-amber-200">
                                        <input 
                                            type="text" 
                                            placeholder="Optional remark if rejecting (e.g. Please choose another time)"
                                            className="w-full bg-white border border-gray-200 text-gray-800 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={rejectionRemark[slot.id] || ''}
                                            onChange={(e) => updateRemark(slot.id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )})
                    )}
                </div>
            </div>
        </div>
    );
};

export default SlotCalendar;
