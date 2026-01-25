import './App.css'
import { useEffect, useState } from 'react';
import { Loader } from '@react-three/drei';
import DrawResults from './components/DrawResults.jsx';
import BackgroundAudio from './components/BackgroundAudio.jsx';
import HeroSection from './components/HeroSection.jsx';
import useGameDraws from './hooks/useGameDraws';
import InputSection from './components/InputSection.jsx';

function App() {
  const draws = useGameDraws()

  const initialSeconds = 7000;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) {
          return initialSeconds;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds]);


  return (
    <div className='HeroSection max-w-screen min-h-screen h-full overflow-x-hidden'>
      {/* <Loader
        containerStyles={{ background: '#000', zIndex: 1000 }}
        innerStyles={{ backgroundColor: '#fff' }}
        barStyles={{ backgroundColor: '#22c55e' }}
        textStyles={{ color: '#fff', fontSize: 22 }}
        dataStyles={{ color: '#aaa' }}
        speed={1}
        />
        <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#0b74e479]"></div>

      
      <HeroSection secondsLeft={secondsLeft} />
      <DrawResults secondsLeft={secondsLeft} /> */}
      <div className="fixed w-100 h-50 top-1/2 -translate-y-1/2 right-20 blur-[180px] rounded-full bg-[#0bc3e483]"></div>

      <InputSection />

      <BackgroundAudio />
    </div>
  )
}

export default App
