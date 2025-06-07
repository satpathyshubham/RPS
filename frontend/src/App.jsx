import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Register from './components/Register';
import Login    from './components/Login';
import Lobby    from './components/Lobby';
import Room     from './components/Room';
import { AuthContext } from './context/AuthContext';
import AuthPage from './components/AuthPage';

export default function App() {
  const { user } = useContext(AuthContext);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />}>
          <Route index element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
        </Route>
        <Route path="/login"    element={<Login />} />
        <Route
          path="/lobby"
          element={user ? <Lobby/> : <Navigate to="/login" replace />}
          />
        <Route
          path="/room/:id"
          element={user ? <Room/> : <Navigate to="/login" replace />}
          />
        <Route path="*" element={<Navigate to={user ? "/lobby":"/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
