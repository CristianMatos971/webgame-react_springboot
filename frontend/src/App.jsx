import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GameCanvas from './components/GameCanvas'; // Ajuste o caminho se necessário
import MainMenu from './pages/MainMenu'; // Ajuste o caminho se necessário

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Starting route: Menu */}
        <Route path="/" element={<MainMenu />} />

        {/* Game Route */}
        <Route path="/play" element={<GameCanvas />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;