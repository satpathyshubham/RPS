import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import Game from './Game';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Paper,
    CircularProgress
} from '@mui/material';
import IconButton from '@mui/material/IconButton'
let socket;

export default function Room() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const [players, setPlayers] = useState([]);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
            auth: { token: localStorage.getItem('token') }
        });

        socket.emit('joinRoom', id);

        socket.on('roomData', data => {
            setPlayers(data);
            setJoined(true);
        });

        socket.on('errorMsg', msg => {
            alert(msg);
            if (msg === 'Room not found' || msg === 'Auth error') {
                navigate('/lobby');
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id, navigate]);

    const handleLeave = () => {
        navigate('/lobby');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!joined) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">Joining room…</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
                        <img
                            src="/rock-paper-scissors.png"
                            alt="RPS Logo"
                            width={32}
                            height={32}
                        />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {user?.username}
                    </Typography>
                    <Button color="inherit" onClick={handleLeave}>
                        Leave Room
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ flexGrow: 1, py: 4 }}>
                <Typography variant="body2" sx={{ color: 'grey' }} gutterBottom>
                    Room ID: {id}
                </Typography>

                {players.length === 2 ? (
                    <Game socket={socket} players={players} roomId={id} />
                ) : (
                    <Paper sx={{ p: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1
                            }}
                        >
                            <CircularProgress size={24} />
                            <Typography>Waiting for opponent…</Typography>
                        </Box>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
