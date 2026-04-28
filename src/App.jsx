import './App.css'
import BackgroundAudio from './components/BackgroundAudio.jsx';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Game from './pages/Game.jsx';
import useGameDraws from './hooks/useGameDraws.js';
import ErrorPage from './pages/ErrorPage.jsx';

function App() {
  // const { gameMeta, lastDraws, init, loading, lotteryLoading } = useGameDraws('2c9f809f9953433d019955276c3e0003');

  return (
    <div className='HeroSection max-w-screen min-h-screen h-full overflow-x-hidden customScroll'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
      <BackgroundAudio />
    </div>
  )
}

export default App;
