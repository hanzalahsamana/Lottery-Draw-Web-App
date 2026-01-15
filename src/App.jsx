import './App.css'
import DrawList from './components/DrawList.jsx';
import { getDrawResults } from './hooks/DrwaResults.js';
import MgpeMonitor from './hooks/MgpeMonitor.jsx';
import useGameDraws from './hooks/useGameDraws.js';
import ModelRender from './components/ModelRender';

function App() {
  // const draws = useGameDraws()

  return (
    <div className='HeroSection w-screen overflow-x-hidden'>
      <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#e47f0b79]"></div>
      <div className="fixed w-250 h-75 -top-10 -left-7.5 blur-[190px] rounded-full bg-[#751de19f]"></div>


      <div className=' h-125  overflow-hidden flex items-center justify-between px-10'>
        {/* <MgpeMonitor/> */}
        {/* <DrawList draws={draws}/> */}

        <div className='z-20'>
          <h1 className='font-bold text-[#FEB906] text-[65px]/[85px]'>Millions in prizes,</h1>
          <h1 className='font-bold text-[#ffffff] text-[65px]/[85px]'>Just one ticket away.</h1>
        </div>
        <ModelRender />
      </div>

      <div className='h-screen w-screen overflow-hidden flex items-center justify-between px-10'>

      </div>
    </div>
  )
}

export default App
