import { Loader } from '@react-three/drei';
import DrawResults from './components/DrawResults.jsx';
import './App.css'
import ModelRenderer from './components/ModelComponents/ModelRenderer.jsx';
import BackgroundAudio from './components/BackgroundAudio.jsx';
import LotteryAnnouncer from './components/LotteryAnnouncer.jsx';
import { useEffect, useState } from 'react';
import lotery from '/GameLogos/lottery.jpg';
import ball from '/GameLogos/ball.jpg';
import win from '/GameLogos/win.jpg';

function App() {
  // const draws = useGameDraws()

  const initialSeconds = 70;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) {
          return initialSeconds; // reset when 0
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds]);




  return (
    <div className='HeroSection max-w-screen overflow-x-hidden'>
      <div className='z-[1000]'>
        <Loader
          containerStyles={{ background: '#000', zIndex: 1000 }}
          innerStyles={{ backgroundColor: '#fff' }}
          barStyles={{ backgroundColor: '#22c55e' }}
          textStyles={{ color: '#fff', fontSize: 22 }}
          dataStyles={{ color: '#aaa' }}
          speed={1}
        />
      </div>
      <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#e47f0b79]"></div>
      {/* <div className="fixed w-250 h-75 -top-10 -left-7.5 blur-[190px] rounded-full bg-[#751de19f]"></div> */}
      <div className=' md:h-112.5  flex items-center md:flex-row flex-col justify-between px-6'>
        <div className='z-20  mt-6'>
          <h1 className='font-bold animteUpDown text-[#FEB906] text-[35px] md:text-[50px]/[70px]'>Millions in prizes,</h1>
          <h1 className='font-bold animteUpDown text-[#ffffff]  text-[35px] md:text-[50px]/[70px]'>Just one ticket away.</h1>
          <button className='bg-gradient-to-b animteUpDown from-[#3c049d] to-[#2b0370] text-white px-6 py-3 rounded-md text-sm mt-4'>Winnig For #649HF013242</button>
          <div className='flex animteUpDown flex-col items-start gap-2 mt-8'>
            <p className='text-white/80 text-sm'>Browse more games</p>
            <div className='flex items-center gap-4 '>
              <div className='bg-[#0b1220] p-1.5 rounded-lg cursor-pointer flex gap-2 items-start'>
                <img src={ball} alt="" className='w-[50px] h-[50px] rounded-md' />
                <div className='flex flex-col gap-1'>
                  <p className='text-white font-medium text-sm'>Bingo</p>
                  <p className='text-white/80 text-xs'>Card game</p>
                </div>
              </div>
              <div className='bg-[#0b1220] p-1.5 rounded-lg cursor-pointer flex gap-2 items-start'>
                <img src={win} alt="" className='w-[50px] h-[50px] rounded-md' />
                <div className='flex flex-col gap-1'>
                  <p className='text-white font-medium text-sm'>Winner</p>
                  <p className='text-white/80 text-xs'>Who will be?</p>
                </div>
              </div>
              <div className='bg-[#0b1220] p-1.5 rounded-lg cursor-pointer flex gap-2 items-start'>
                <img src={lotery} alt="" className='w-[50px] h-[50px] rounded-md' />
                <div className='flex flex-col gap-1'>
                  <p className='text-white font-medium text-sm'>Lottery</p>
                  <p className='text-white/80 text-xs'>Luck depends</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ModelRenderer secondsLeft={secondsLeft} />
      </div>

      <DrawResults secondsLeft={secondsLeft} />

      <BackgroundAudio />
    </div>
  )
}

export default App
