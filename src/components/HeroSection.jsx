import { useEffect, useRef, useState } from 'react';
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

const HeroSection = ({ secondsLeft, gameMeta }) => {

 
    return (
        <div className=' md:h-112.5  flex items-center md:flex-row flex-col justify-between px-6'>
            <div className='z-20  mt-8'>
                <h1 className='font-bold animteUpDown text-[#FEB906] text-[35px] md:text-[50px]/[70px]'>Millions in prizes,</h1>
                <h1 className='font-bold animteUpDown text-[#ffffff]  text-[35px] md:text-[50px]/[70px]'>Just one ticket away.</h1>
                <button className='bg-linear-to-b animteUpDown from-[#3c049d] to-[#2b0370] text-white px-6 py-3 rounded-md text-sm mt-4'>Winnig For #{gameMeta?.drawNo}</button>
                <div className='flex animteUpDown flex-col items-start gap-2 mt-8'>
                    <p className='text-white/80 text-sm'>Browse more games</p>
                    <div className='flex items-center gap-4 '>
                        {games?.map((game, i) => (
                            <div key={i} className='bg-[#0b1220] p-1.5 rounded-lg cursor-pointer flex gap-2 items-start'>
                                <img src={game.image} alt="" className='w-12.75 h-11.25 rounded-md' />
                                <div className='flex flex-col gap-1'>
                                    <p className='text-white font-medium text-sm'>{game.name}</p>
                                    <p className='text-white/80 text-xs'>{game.subText}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* 
            {isActive && (
                <div className='fixed flex px-4 items-center justify-evenly rounded-lg top-7 left-1/2 -translate-x-1/2 w-[300px] h-[50px] bg-[#0b1220]'>
                    <div className='absolute w-[1px] h-[30px] -top-[30px] left-4 bg-gray-700'></div>
                    <div className='absolute w-[4px] h-[4px] top-[10px] left-[14px] bg-gray-700 rounded-full'></div>
                    <div className='absolute w-[4px] h-[4px] top-[10px] right-[14px] bg-gray-700 rounded-full'></div>
                    <div className='absolute w-[1.5px] h-[30px] -top-[30px] right-4 bg-gray-700'></div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-gray-800" >
                        </div>
                    ))}
                </div>
            )} */}

           

            <ModelRenderer secondsLeft={secondsLeft} />
        </div>
    )
}

export default HeroSection