import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        const credentials = {
            'spyke': import.meta.env.VITE_ADMIN_PASS_SPYKE,
            'louis': import.meta.env.VITE_ADMIN_PASS_LOUIS,
            'joules': import.meta.env.VITE_ADMIN_PASS_JOULES,
        };

        const inputUser = username.toLowerCase().trim();
        const correctPassword = credentials[inputUser];

        if (correctPassword && password === correctPassword) {
            localStorage.setItem('adminToken', `token-${inputUser}-${Date.now()}`);
            navigate('/admin/dashboard');
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <h2>Maison Arlo Raciàto</h2>
                <p>Administrative Access</p>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="admin-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
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
