import { forwardRef, useEffect, useRef, useState } from 'react';
import ModelRenderer from './ModelComponents/ModelRenderer'
import BilliardBall from './BilliardBall';
import { announceNumbers } from '../hooks/ttsAnnouncer';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

const games = [
    {
        name: 'Bingo',
        subText: 'Card game',
        image: '/GameLogos/bingo2.jpg',
    },
    {
        name: 'Winner',
        subText: 'Who will be?',
        image: '/GameLogos/winner2.jpg',
    },
    {
        name: 'Lottery',
        subText: 'Luck depends',
        image: '/GameLogos/lottery2.jpg',
    },
]

const HeroSection = forwardRef(({ currentDraw }, ref) => {
    return (
        <div className="md:h-125 2xl:h-150 flex flex-col md:flex-row items-center md:items-center justify-between px-4 sm:px-17 py-6 md:py-0 gap-8 md:gap-0">
            <div className="z-20 flex flex-col gap-1 md:gap-0 2xl:gap-4 mt-10 -mb-25 md:mb-0 md:mt-6 w-full md:w-max">
                <h1 className="font-bold text-[#FEB906] text-[30px] sm:text-[35px] md:text-[55px]/[70px] 2xl:text-[70px]/[70px]">Millions in prizes,</h1>
                <h1 className="font-bold text-[#ffffff] text-[30px] sm:text-[35px] md:text-[55px]/[70px] 2xl:text-[70px]/[70px]">Just one ticket away.</h1>

                <div className="flex flex-col gap-2.5 mt-6 bg-[#0b12209c] w-full md:w-max ring-2 ring-white/15 text-white px-4 pt-2.5 pb-3.5 rounded-md text-[15px] 2xl:text-base">
                    {currentDraw?.drawNo ?
                        (<p>Current Draw <span className='font-medium'>#{currentDraw?.drawNo}</span></p>) :
                        (<p>There Is Not Any Current Draw Yet.</p>)
                    }
                    {currentDraw?.status === 'waiting' ? (
                        <div className='italic text-white/80 font-light py-1'>
                            Waiting For Result....
                        </div>
                    ) : (
                        <div className='flex gap-2.5'>
                            {[1, 2, 3, 4, 5, 6].map((num, i) => (
                                <div key={i} className={`w-7 scale-[1.05] aspect-square flex items-center justify-center rounded-full ${true ? 'bg-gray-600' : ''}`}>
                                    {currentDraw?.resultNo?.[i] ? <BilliardBall ballNo={currentDraw?.resultNo?.[i]} /> : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <ModelRenderer ref={ref} ballCount={!currentDraw?.drawNo ? 0 : 51} />
        </div >
    )
})

export default HeroSection