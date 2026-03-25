import React, { useState, useEffect } from 'react';
import CounselorSidebar from '../components/CounselorSidebar';
import StudentCard from '../components/StudentCard';
import ChatInterface from '../components/ChatInterface';

const MOCK_STUDENTS = [
    { id: '1', name: 'Current Student (Demo)', collegeId: 'CS2024-001', batch: '2024', studentClass: 'CS Year 3' },
    { id: '2', name: 'Sarah Williams', collegeId: 'ENG2025-042', batch: '2025', studentClass: 'Engineering Year 2' },
    { id: '3', name: 'Michael Chen', collegeId: 'BUS2023-112', batch: '2023', studentClass: 'Business Year 4' },
];

const StudentChat = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [allChats, setAllChats] = useState({});

    const loadChats = () => {
        const chats = JSON.parse(localStorage.getItem('counseling_all_chats') || '{}');
        setAllChats(chats);
    };

    useEffect(() => {
        loadChats();
        const handleStorage = (e) => {
            if (e.key === 'counseling_all_chats') {
                loadChats();
            }
        };
        window.addEventListener('storage', handleStorage);
        const interval = setInterval(loadChats, 1000);
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const checkHasNewMessage = (studentId) => {
        const studentMessages = allChats[studentId];
        if (!studentMessages || studentMessages.length === 0) return false;
        // Check if the last message was sent by the student
        return studentMessages[studentMessages.length - 1].sender === 'student';
    };

    return (
        <div className="flex min-h-screen bg-background">
            <CounselorSidebar />
            <main className="flex-1 ml-64 p-8 flex flex-col h-screen overflow-hidden">
                <header className="mb-6 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-gray-800">Chat with Students</h1>
                    <p className="text-gray-500 mt-2">Select a student to view messages and details.</p>
                </header>
                
                <div className="flex-1 flex gap-6 overflow-hidden pb-8">
                    {/* Left Column: Student List */}
                    <div className="w-1/3 bg-card rounded-2xl p-4 shadow-md border border-gray-100 flex flex-col h-full overflow-hidden">
                        <h2 className="font-bold text-lg text-gray-800 mb-4 px-2">Active Conversations</h2>
                        <div className="overflow-y-auto flex-1 px-2 space-y-1">
                            {MOCK_STUDENTS.map(student => (
                                <StudentCard 
                                    key={student.id} 
                                    student={student} 
                                    isActive={selectedStudent?.id === student.id}
                                    hasNewMessage={checkHasNewMessage(student.id)}
                                    onClick={() => setSelectedStudent(student)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Chat Interface */}
                    <div className="flex-1 h-full">
                        {selectedStudent ? (
                            <ChatInterface student={selectedStudent} />
                        ) : (
                            <div className="bg-card rounded-2xl p-6 shadow-md border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                                <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Student Selected</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Select a student from the list on the left to view their details and start chatting. / Use 'Current Student (Demo)' to test live chat feature.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentChat;
