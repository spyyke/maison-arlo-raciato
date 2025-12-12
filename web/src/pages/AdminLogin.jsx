import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple mock authentication for now, as per implementation plan.
        // In a real app, this would call api/admin/auth
        // Check against environment variable
        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
        if (password === correctPassword) {
            localStorage.setItem('adminToken', 'mock-session-token');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid access key.');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <h2>Maison Arlo Raciàto</h2>
                <p>Administrative Access</p>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Access Key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="admin-input"
                    />
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="btn-bronze btn-full">
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
