import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SlotBooking from '../components/SlotBooking';

const StudentSlotManagement = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('counseling_currentUser');
        if (!user) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Slot Management</h1>
                    <p className="text-gray-500 mt-2 text-lg">Book and manage your sessions with your counselor.</p>
                </header>

                <div className="max-w-5xl">
                    <SlotBooking />
                </div>
            </main>
        </div>
    );
};

export default StudentSlotManagement;
