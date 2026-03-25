import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, CalendarDays } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('counseling_currentUser');
        navigate('/');
    };

    const navItemClass = ({ isActive }) =>
        `flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 ${isActive
            ? 'bg-secondary text-primary shadow-md'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`;

    return (
        <div className="w-64 h-screen bg-primary border-r border-primary/20 flex flex-col p-6 fixed left-0 top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">
            <div className="flex items-center space-x-3 mb-10 pl-2">
                <span className="text-xl font-bold text-white leading-tight">
                    Intelligent College<br/>Counseling System
                </span>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink to="/dashboard" className={navItemClass}>
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Dashboard</span>
                </NavLink>
                <NavLink to="/slot-management" className={navItemClass}>
                    <CalendarDays size={20} />
                    <span className="font-medium">Slot Management</span>
                </NavLink>
                <NavLink to="/profile" className={navItemClass}>
                    <User size={20} />
                    <span className="font-medium">Profile</span>
                </NavLink>
            </nav>

            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full p-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
