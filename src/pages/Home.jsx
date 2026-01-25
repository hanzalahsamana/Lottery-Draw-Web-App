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
        <div className='flex justify-between gap-5 w-full min-h-screen h-full items-center px-7.5'>
            <div className="fixed w-100 h-50 top-1/2 -translate-y-1/2 right-20 blur-[180px] rounded-full bg-[#0bc3e483]"></div>

            <div className='flex flex-col gap-3 w-full max-w-[50%] animteUpDown'>
                <h1 className='font-bold text-[#FEB906] text-[35px] md:text-[50px]/[50px]'>
                    Millions in prizes,
                </h1>
                <h1 className='font-bold text-[#ffffff] text-[35px] md:text-[50px]/[50px]'>
                    Just one ticket away.
                </h1>

                <p className='text-[#ffffff] font-light mt-5 mb-5 font-po'>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>

                <form onSubmit={handleSubmit} className='flex gap-3 items-center h-11.25'>
                    <div className='flex relative items-center gap-2 border-[#fff5f58e] border-[1.5px] text-[14px]/[14px] font-light text-[#ffffffdd] px-3 rounded-md w-full max-w-[310px] h-full'>
                        <p>#</p>
                        <input
                            type="text"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            className='border-0 outline-0 h-full flex-1 bg-transparent'
                            placeholder='Game Id'
                        />

                        {error && <p className='absolute left-0 -bottom-5.5 text-red-500 text-xs font-medium'>{error}</p>}
                    </div>

                    <button
                        type='submit'
                        className='bg-linear-to-b from-[#3c049d] to-[#2b0370] text-white px-3 h-full rounded-md text-sm flex gap-2 items-center'
                    >
                        Check Draws
                        <FaArrowRightLong />
                    </button>
                </form>
            </div>

            <div>
                <img className='w-137.5 h-full' src="/HeroSide2.png" alt="" />
                <img className='fixed -bottom-12.5 -left-14 w-37.5' src="/redball.png" alt="" />
                <img className='fixed -top-20 -right-20 w-50' src="/blackball.png" alt="" />
            </div>
        </div>
    )
}

export default Home
