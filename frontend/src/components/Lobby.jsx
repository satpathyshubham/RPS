import { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export default function Lobby() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await API.get('/rooms');
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    try {
      const { data } = await API.post('/rooms');
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleJoin = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Lobby — {user?.username}
          </Typography>
          <Button color="inherit" onClick={handleCreateRoom}>
            Create Room
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Rooms
        </Typography>

        {rooms.length === 0 ? (
          <Typography>No rooms available. Click “Create Room” to start one!</Typography>
        ) : (
          <List>
            {rooms.map((roomId) => (
              <ListItem key={roomId} disablePadding>
                <ListItemButton onClick={() => handleJoin(roomId)}>
                  <ListItemText primary={`Room ${roomId}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
}
