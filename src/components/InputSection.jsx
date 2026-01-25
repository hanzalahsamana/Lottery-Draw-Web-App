import React from 'react'
import { FaArrowRightLong } from 'react-icons/fa6'

const InputSection = () => {
    return (
        <div className='flex justify-between  gap-5 w-full min-h-screen h-full items-center  px-7.5'>
            <div className='flex flex-col gap-5'>
                <h1 className='font-bold text-[#FEB906] text-[35px] md:text-[50px]/[50px]'>Millions in prizes,</h1>
                <h1 className='font-bold text-[#ffffff] text-[35px] md:text-[50px]/[50px]'>Just one ticket away.</h1>
                <p className='text-[#ffffffc1] font-light mt-8 font-po'>Please enter game id to check draws of specific game</p>
                <div className='flex gap-3 items-center h-11.25 mt-'>
                    <div className='flex items-center gap-2 border-[#fff5f58e] border-[1.5px] text-[14px]/[14px] font-light text-[#ffffffdd] px-3 rounded-md w-full max-w-[310px] h-full'>
                        <p className=''>#</p>
                        <input type="text" className='border-0 outline-0 h-full flex-1' />
                    </div>
                    <button className='bg-linear-to-b from-[#3c049d] to-[#2b0370] text-white px-3 h-full rounded-md text-sm flex gap-2 items-center '>
                        Check Draws
                        <FaArrowRightLong />
                    </button>
                </div>
            </div>
            <div>
                <img className='w-137.5 h-full' id="mask" src="/HeroSide2.png" alt="" />
                <img className='fixed -bottom-12.5 -left-14 w-37.5' id="mask" src="/redball.png" alt="" />
                <img className='fixed -top-20 -right-20 w-50' id="mask" src="/blackball.png" alt="" />
            </div>
        </div>
    )
}

export default InputSection