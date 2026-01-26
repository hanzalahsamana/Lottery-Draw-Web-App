import React, { useState } from 'react'
import { FaArrowRightLong } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const [gameId, setGameId] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()

        const value = gameId.trim()

        if (!value) {
            setError('Please enter your game ID')
            return
        }

        if (/\s/.test(gameId)) {
            setError('Game ID must not contain spaces')
            return
        }

        setError('')
        navigate(`/game?game_id=${encodeURIComponent(value)}`)
    }

    return (
        <div className="flex flex-col md:flex-row justify-between gap-5 w-full min-h-screen items-center px-6 md:px-7.5 py-8">
            {/* decorative blur (hidden on small screens to avoid overflow) */}
            <div className="hidden md:block fixed w-100 h-50 top-1/2 -translate-y-1/2 right-20 blur-[180px] rounded-full bg-[#0bc3e483]"></div>

            {/* left column: heading + form */}
            <div className="flex flex-col gap-1 w-full md:max-w-[50%] animteUpDown mt-10 md:mt-0">
                <h1 className="font-bold text-[#FEB906] text-[30px] sm:text-[35px] md:text-[50px] leading-tight">
                    Millions in prizes,
                </h1>
                <h1 className="font-bold text-[#ffffff] text-[30px] sm:text-[35px] md:text-[50px] leading-tight">
                    Just one ticket away.
                </h1>

                <p className="text-[#ffffff] font-light mt-5 mb-5 font-po max-w-lg">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center w-full">
                    <div className="flex relative items-center gap-2 border-[#fff5f58e] border-[1.5px] text-[14px] font-light text-[#ffffffdd] px-3 rounded-md w-full md:max-w-[310px] h-11">
                        <p>#</p>
                        <input
                            type="text"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            className="border-0 outline-0 h-full flex-1 bg-transparent placeholder:text-[#ffffffbb]"
                            placeholder="Game Id"
                        />

                        {error && (
                            <p className="absolute left-0 -bottom-5.5 text-red-500 text-xs font-medium">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-linear-to-b cursor-pointer hover:opacity-85 text-center flex items-center justify-center from-[#3c049d] to-[#2b0370] text-white px-4 h-11 rounded-md text-sm flex gap-2 w-full md:w-max items-center flex-shrink-0"
                    >
                        Check Draws
                        <FaArrowRightLong />
                    </button>
                </form>
            </div>

            {/* right column: images */}
            <div className="w-full md:w-auto flex justify-center md:justify-end items-end relative mt-6 md:mt-0">
                <img
                    className="w-full max-w-[520px] h-auto object-contain"
                    src="/HeroSide2.png"
                    alt=""
                />

                {/* decorative balls: show only on md+ to avoid layout problems */}
                <img
                    className="hidden md:block fixed md:-bottom-12.5 md:-left-14 w-37.5"
                    src="/redball.png"
                    alt=""
                />
                <img
                    className="hidden md:block fixed md:-top-20 md:-right-20 w-50"
                    src="/blackball.png"
                    alt=""
                />
            </div>
        </div>

    )
}

export default Home
