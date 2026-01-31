import BilliardBall from './BilliardBall'
import { AiOutlineDollarCircle } from 'react-icons/ai';
import AnimationWrapper from './AnimationWrapper';
import { useEffect, useState } from 'react';
import { formatDaysHoursMinutesSeconds, formatYYYYMMDD } from '../utils/dateUtil';

const dummyData = [
    'purple',
    'yellow',
    'red',
    'orange',
    'blue',
];


const DrawResults = ({ secondsLeft, draws, metadata }) => {

    return (
        <div className='bg-transparent w-full py-13.5 px-2.5 md:px-7.5 overflow-hidden'>
            <div className=' bg-linear-to-b from-[#0b1220] to-[#071124]/60 shadow-2xl px-4 md:px-12.5 py-15 w-full min-h-75 rounded-[15px] relative borde-[1.4px] borde-[#6b728d] z-0 ring-[1.5px] ring-white/15'>
                <div className='w-65 md:w-100 absolute shadow-2xl flex items-center justify-center left-1/2 -translate-x-1/2 h-12.5 -top-13 rounded-t-[15px] bg-[#0b1220] ring-[1.5px] ring-white/15 border-b-0 z-10'>
                    <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#0b1220]"></div>
                    <div className="absolute left-1/2 -top-2.5 transform -translate-x-1/2 w-40 md:w-72 h-24 rounded-2xl bg-linear-to-r from-[#7c3aed] to-[#06b6d4] opacity-20 blur-xl z-10" />
                    <div className='flex items-center gap-2 absolute -bottom-7 flex-col z-10'>
                        <p className='text-gray-300 text-[12px]/[12px] 2xl:text-[14px]/[14px] text-shadow-xs font-medium uppercase tracking-wide'>
                            Next Draw In
                        </p>
                        <div className="countdown text-[40px]/[38px] 2xl:text-[45px]/[45px] font-extrabold tracking-[1px]">
                            {formatDaysHoursMinutesSeconds(secondsLeft)}
                        </div>
                    </div>

                </div>


                <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] flex flex-col gap-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-6 justify-between pb-3.75 px-5 text-white/60 font-normal text-sm 2xl:text-base relative">
                            <p className="flex-1 px-5 text-start text-nowrap">Draw No</p>
                            <p className="flex-1 px-5 text-center text-nowrap">Game Name</p>
                            <p className="flex-1 col-span-2 px-5 text-center text-nowrap">Winning Numbers</p>
                            <p className="flex-1 px-5 text-center text-nowrap">Date</p>
                            <p className="flex-1 px-5 text-end text-nowrap">Special Number</p>
                        </div>

                        {/* Table Rows */}
                        {draws?.map((row, index) => {
                            const winningNumbers = row?.resultNo?.split(",");
                            const formattedDate = formatYYYYMMDD(row.drawDate);

                            return (
                                <div
                                    key={index}
                                    className={`w-full h-12.5 rounded-lg px-5 text-[13px] 2xl:text-[15px] text-white/70 grid grid-cols-6 items-center gap-2 min-w-[800px] ${index % 2 === 0 ? "bg-white/5" : "bg-black/0"
                                        } relative`}
                                >
                                    <div className="px-5 text-start text-nowrap flex-1"># {row.drawNo}</div>
                                    <div className="px-5 text-center flex-1 text-nowrap">{row?.gameTypeName || "unknown"}</div>

                                    <div className="px-5 col-span-2 flex items-center justify-center gap-2">
                                        {winningNumbers.map((num, i) => (
                                            <BilliardBall key={i} ballNo={num} color={dummyData[index]} />
                                        ))}
                                    </div>

                                    <div className="px-5 flex-1 text-nowrap text-center">{formattedDate || "no-record"}</div>
                                    <div className="px-5 flex-1 flex justify-end items-center text-nowrap text-center">{row?.speciaNo ? <BilliardBall ballNo={row?.speciaNo} /> : "None"}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>


            </div>
        </div>

    )
}

export default DrawResults