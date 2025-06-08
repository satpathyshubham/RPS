import { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const MOVE_ICONS = {
  rock: '/fist.png',
  paper: '/hand-paper.png',
  scissors: '/scissors.png'
};

export default function Game({ socket, players, roomId }) {
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState(null);
  const [scores, setScores] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'info' });
  const timeoutRef = useRef();

  const { user } = useContext(AuthContext);
  const me       = user.username;
  const meId     = players.find(p => p.username === me)?.id;
  const opponent = players.find(p => p.username !== me)?.username || '';
  const opId     = players.find(p => p.username !== me)?.id;

  // get initial scores when the room updates
  useEffect(() => {
    socket.on('roomData', ({ scores: newScores }) => {
      setScores(newScores);
    });
    return () => {
      socket.off('roomData');
    };
  }, [socket]);

  const makeMove = (move) => {
    socket.emit('makeMove', { roomId, move });
    setHasMoved(true);
  };

  // handle round results
  useEffect(() => {
    socket.on('roundResult', ({ moves, winner, scores: newScores }) => {
      setSelectedMoves(moves);
      setHasMoved(false);
      if (newScores) setScores(newScores);

      let msg, sev;
      if (winner === 'draw') {
        msg = 'Draw!';
        sev = 'info';
      } else if (winner === me) {
        msg = 'You win!';
        sev = 'success';
      } else {
        msg = 'Opponent wins!';
        sev = 'warning';
      }
      setSnack({ open: true, msg, sev });

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSelectedMoves(null), 2000);
    });
    return () => {
      socket.off('roundResult');
      clearTimeout(timeoutRef.current);
    };
  }, [socket, me]);

  const handleSnackClose = () => {
    setSnack(s => ({ ...s, open: false }));
  };

  return (
    <Box
      sx={{
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '60vh',
        justifyContent: 'space-between'
      }}
    >
      <Paper
        sx={{
          p: 1,
          minWidth: 140,
          textAlign: 'center',
          bgcolor: 'secondary.main',
          color: theme => theme.palette.common.white
        }}
      >
        <Typography variant="subtitle2">
          Score: {scores[opId] ?? 0}
        </Typography>
        <Typography>{opponent}</Typography>
        {selectedMoves?.[opId] && (
          <Box
            component="img"
            src={MOVE_ICONS[selectedMoves[opId]]}
            alt={selectedMoves[opId]}
            width={48}
            height={48}
            sx={{ mt: 1 }}
          />
        )}
      </Paper>

      <Stack direction="row" spacing={2}>
        {Object.entries(MOVE_ICONS).map(([move, icon]) => (
          <IconButton
            key={move}
            onClick={() => makeMove(move)}
            disabled={hasMoved}
            sx={{
              border: '2px solid',
              borderColor: hasMoved ? 'grey.400' : 'primary.main',
              borderRadius: 2,
              p: 1
            }}
          >
            <img src={icon} alt={move} width={48} height={48} />
          </IconButton>
        ))}
      </Stack>

      <Paper
        sx={{
          p: 1,
          minWidth: 140,
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: theme => theme.palette.common.white
        }}
      >
        <Typography variant="subtitle2">
          Score: {scores[meId] ?? 0}
        </Typography>
        {selectedMoves?.[meId] && (
          <Box
            component="img"
            src={MOVE_ICONS[selectedMoves[meId]]}
            alt={selectedMoves[meId]}
            width={48}
            height={48}
            sx={{ mt: 1 }}
          />
        )}
        <Typography>{me}</Typography>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snack.sev}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
