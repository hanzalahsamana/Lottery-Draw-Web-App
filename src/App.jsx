import './App.css'
import BackgroundAudio from './components/BackgroundAudio.jsx';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Game from './pages/Game.jsx';

function App() {

  return (
    <div className='HeroSection max-w-screen min-h-screen h-full overflow-x-hidden'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
      <BackgroundAudio />
    </div>
  )
}

export default App;
