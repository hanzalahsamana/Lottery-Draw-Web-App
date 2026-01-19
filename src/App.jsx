import './App.css'
import ModelRender from './components/ModelRender';
import SecondComp from './components/SecondComp.jsx';
import useGameDraws from './hooks/useGameDraws';

function App() {
  // const draws = useGameDraws()

  return (
    <div className='HeroSection max-w-screen overflow-x-hidden'>
      <ModelRender />
      {/* <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#e47f0b79]"></div>
      <div className="fixed w-250 h-75 -top-10 -left-7.5 blur-[190px] rounded-full bg-[#751de19f]"></div>


      <div className=' md:max-h-[400px]  overflow-hidden flex items-center md:flex-row flex-col justify-between px-10'>
        <div className='z-20'>
          <h1 className='font-bold text-[#FEB906] text-[35px] md:text-[65px]/[85px]'>Millions in prizes,</h1>
          <h1 className='font-bold text-[#ffffff]  text-[35px] md:text-[65px]/[85px]'>Just one ticket away.</h1>
        </div>
      </div>

      <SecondComp /> */}



    </div>
  )
}

export default App
