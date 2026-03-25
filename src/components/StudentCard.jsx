import React from 'react';
import { UserRound } from 'lucide-react';

const StudentCard = ({ student, isActive, onClick, hasNewMessage }) => {
    return (
        <div 
            onClick={onClick}
            className={`p-4 cursor-pointer rounded-xl border transition-all duration-200 mb-3 flex items-center justify-between
                ${isActive ? 'bg-secondary border-secondary shadow-md text-primary' : 'bg-card border-gray-100 hover:border-secondary/50 hover:bg-white'}
            `}
        >
            <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <UserRound size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{student.name}</h3>
                    <p className={`text-xs ${isActive ? 'text-primary/80' : 'text-gray-500'}`}>ID: {student.collegeId} • {student.batch}</p>
                </div>
            </div>
            
            {hasNewMessage && (
                <div className="flex flex-col items-center">
                    <span className="flex h-3 w-3 relative mb-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">New Message</span>
                </div>
            )}
        </div>
    );
};

export default StudentCard;
