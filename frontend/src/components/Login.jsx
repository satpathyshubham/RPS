import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';

export default function Login({ setFlag }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { user ,saveUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/lobby', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { username, password });
            const { token } = data;
            const user = JSON.parse(atob(token.split('.')[1])).user;
            saveUser(user, token);
            navigate('/lobby');
        } catch (e) {
            alert(e.response?.data?.msg || 'Login failed');
        }
    };
    return (
        <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={3}
            sx={{
                width: '100%',
                maxWidth: 400,
                p: 4,
                borderRadius: 3,
            }}
        >
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Login
            </Typography>
            <Typography variant="body2" sx={{ mb: 6 }}>
                New user? <p style={{ cursor: 'pointer', color: 'blue', display: 'inline' }} onClick={() => { navigate('/register') }}>Create an account</p>
            </Typography>

            <TextField
                fullWidth
                placeholder="Username"
                size="small"
                sx={{ mb: 2 }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
            />
            <TextField
                fullWidth
                placeholder="Password"
                size="small"
                type="password"
                sx={{ mb: 6 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />

            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mb: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
                Login
            </Button>
        </Paper>
    )
}