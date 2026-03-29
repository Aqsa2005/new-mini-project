import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { User, Mail, Hash, Phone, KeyRound, Edit2, Check, X, Camera } from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Editable fields
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState('');
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        const currentUser = localStorage.getItem('counseling_currentUser');
        if (!currentUser) {
            navigate('/');
        } else {
            const parsed = JSON.parse(currentUser);
            setUser(parsed);
            setPhone(parsed.phone || '');
            setProfilePic(parsed.profilePic || '');
        }
    }, [navigate]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1048576) { // 1MB limit for firestore document size safety
                setError('Image must be less than 1MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const uid = user.uid;
            const updates = { phone, profilePic };
            
            // 1. Update Firestore
            await updateDoc(doc(db, 'users', uid), updates);
            
            // 2. Update Auth Password if provided
            if (password.trim().length > 0) {
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                if (auth.currentUser) {
                    await updatePassword(auth.currentUser, password);
                } else {
                    throw new Error('Authentication session expired. Please re-login to change password.');
                }
            }

            // 3. Update Local Storage
            const updatedUser = { ...user, ...updates };
            localStorage.setItem('counseling_currentUser', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setPassword(''); // clear password field
            
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/requires-recent-login') {
                setError('For security reasons, please log out and log back in before changing your password.');
            } else {
                setError(err.message || 'Failed to update profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setPhone(user.phone || '');
        setProfilePic(user.profilePic || '');
        setPassword('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage your personal information.</p>
                    </div>
                </header>

                <div className="max-w-3xl bg-card rounded-2xl shadow-sm border border-gray-100 p-8">
                    
                    {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
                    {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">{success}</div>}

                    <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center space-x-6">
                            <div className="relative group">
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-sm border-4 border-white" />
                                ) : (
                                    <div className="w-24 h-24 bg-gradient-to-br from-secondary to-background rounded-full flex items-center justify-center text-primary text-3xl font-bold shadow-inner">
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                    </div>
                                )}
                                
                                {isEditing && (
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-secondary hover:text-primary transition-colors border-2 border-white"
                                    >
                                        <Camera size={14} />
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">{user.fullName || user.name || 'Student'}</h2>
                                <p className="text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-3 py-1 rounded-full text-sm">Student Account</p>
                            </div>
                        </div>

                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <Edit2 size={18} /> Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={cancelEdit}
                                    disabled={loading}
                                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <X size={18} /> Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-primary text-white hover:bg-secondary hover:text-primary px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
                                >
                                    <Check size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Immutable Fields */}
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-gray-300 rounded-full inline-block"></span>
                                Account Information
                            </h3>
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center space-x-3 text-gray-400 mb-1.5">
                                    <User size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Full Name</span>
                                </div>
                                <p className="text-gray-600 font-medium pl-7">{user.fullName || user.name}</p>
                                <p className="text-[10px] text-gray-400 pl-7 mt-1 italic">Cannot be changed</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center space-x-3 text-gray-400 mb-1.5">
                                    <Mail size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Email Address</span>
                                </div>
                                <p className="text-gray-600 font-medium pl-7">{user.email}</p>
                                <p className="text-[10px] text-gray-400 pl-7 mt-1 italic">Cannot be changed</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center space-x-3 text-gray-400 mb-1.5">
                                    <Hash size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">College ID</span>
                                </div>
                                <p className="text-gray-600 font-medium pl-7">{user.collegeId}</p>
                                <p className="text-[10px] text-gray-400 pl-7 mt-1 italic">Cannot be changed</p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                                Personal Details
                            </h3>
                            
                            <div className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-white border-primary/30 shadow-sm' : 'bg-background border-gray-100'}`}>
                                <div className="flex items-center space-x-3 text-primary/70 mb-2">
                                    <Phone size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</span>
                                </div>
                                <div className="pl-7">
                                    {isEditing ? (
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                        />
                                    ) : (
                                        <p className="text-gray-800 font-medium">{user.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                                    )}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-white border-primary/30 shadow-sm' : 'bg-background border-gray-100'}`}>
                                <div className="flex items-center space-x-3 text-primary/70 mb-2">
                                    <KeyRound size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Security</span>
                                </div>
                                <div className="pl-7">
                                    {isEditing ? (
                                        <div>
                                            <input 
                                                type="password" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter new password (optional)"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1.5">Leave blank to keep your current password</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-800 font-medium tracking-[0.2em] mt-1">••••••••</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
