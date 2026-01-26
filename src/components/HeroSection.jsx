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

const HeroSection = forwardRef(({ secondsLeft, gameMeta }, ref) => {
    return (
        <div className="md:h-112.5 flex flex-col md:flex-row items-center md:items-center justify-between px-4 sm:px-6 py-6 md:py-0 gap-8 md:gap-0">
            {/* Left column: headings and button */}
            <div className="z-20 flex flex-col gap-1 md:gap-0 mt-10 mb-[-100px] md:mb-0 md:mt-6 w-full md:w-max">
                <h1 className="font-bold animteUpDown text-[#FEB906] text-[30px] sm:text-[35px] md:text-[50px]/[70px]">
                    Millions in prizes,
                </h1>
                <h1 className="font-bold animteUpDown text-[#ffffff] text-[30px] sm:text-[35px] md:text-[50px]/[70px]">
                    Just one ticket away.
                </h1>
                <button className="bg-linear-to-b w-full md:w-max animteUpDown from-[#3c049d] to-[#2b0370] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-md text-sm mt-4">
                    Winnig For #{gameMeta?.drawNo}
                </button>

                {/* Browse more games */}
                <div className="hidden md:flex animteUpDown flex-col items-start gap-3 mt-6 w-full">
                    <p className="text-white/80 text-sm">Browse more games</p>
                    <div className="flex flex-row gap-4 w-full  pb-2">
                        {games?.map((game, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 bg-[#0b1220] p-1.5 rounded-lg cursor-pointer flex flex-col md:flex-row gap-2 items-start min-w-[140px]"
                            >
                                <img
                                    src={game.image}
                                    alt=""
                                    className="w-11 sm:w-13 h-10 sm:h-12 rounded-md object-cover"
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="text-white font-medium text-sm">{game.name}</p>
                                    <p className="text-white/80 text-xs">{game.subText}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ModelRenderer secondsLeft={secondsLeft} ref={ref} />
        </div >
    )
})

export default HeroSection