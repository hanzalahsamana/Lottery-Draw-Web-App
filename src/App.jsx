import { Loader } from '@react-three/drei';
import DrawResults from './components/DrawResults.jsx';
import './App.css'
import ModelRenderer from './components/ModelComponents/ModelRenderer.jsx';

function App() {
  // const draws = useGameDraws()

  return (
    <div className='HeroSection max-w-screen overflow-x-hidden'>
      <Loader
        containerStyles={{ background: '#000' }}
        innerStyles={{ backgroundColor: '#fff' }}
        barStyles={{ backgroundColor: '#22c55e' }}
        textStyles={{ color: '#fff', fontSize: 22 }}
        dataStyles={{ color: '#aaa' }}
        speed={1}
      />
      <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#e47f0b79]"></div>
      <div className="fixed w-250 h-75 -top-10 -left-7.5 blur-[190px] rounded-full bg-[#751de19f]"></div>


      <div className=' md:max-h-112.5  overflow-hidden flex items-center md:flex-row flex-col justify-center px-8'>
        <div className='z-20'>
          <h1 className='font-bold text-[#FEB906] text-[35px] md:text-[65px]/[85px]'>Millions in prizes,</h1>
          <h1 className='font-bold text-[#ffffff]  text-[35px] md:text-[65px]/[85px]'>Just one ticket away.</h1>
        </div>

        <ModelRenderer />
      </div>

      <DrawResults />



    </div>
  )
}

export default App
