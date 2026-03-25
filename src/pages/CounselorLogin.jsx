import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const CounselorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (email.toLowerCase() === "counselor@demo.com" && password === "password123") {
            const userData = { email, name: "Dr. Smith", role: "counselor", id: "counselor-01" };
            localStorage.setItem('counselor_currentUser', JSON.stringify(userData));
            navigate('/counselor-dashboard');
        } else {
            setError('Invalid credentials. Please use: counselor@demo.com / password123');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="bg-secondary/30 text-primary p-3 rounded-full inline-block mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Counselor Portal</h1>
                    <p className="text-gray-500 mt-2">Intelligent College Counseling System</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}
                
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                    Demo Credentials:<br/>
                    Email: <span className="font-bold">counselor@demo.com</span><br/>
                    Password: <span className="font-bold">password123</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white/50"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white/50"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-secondary text-white hover:text-primary font-medium py-3 rounded-lg transition-colors shadow-lg shadow-primary/30"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full mt-3 bg-card hover:bg-gray-50 text-gray-500 hover:text-gray-700 border border-gray-200 font-medium py-3 rounded-lg transition-colors"
                    >
                        Back to Student Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CounselorLogin;
