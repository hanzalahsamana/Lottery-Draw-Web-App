import BilliardBall from './BilliardBall'
import { AiOutlineDollarCircle } from 'react-icons/ai';
import AnimationWrapper from './AnimationWrapper';
import { useEffect, useState } from 'react';

const dummyData = [
    {
        serial: 1,
        lotteryId: "#649HF013239",
        winningNumbers: [2, 3, 4, 5, 6, 7],
        color: 'purple',
        time: "11:33 AM, 15 Jan",
        gameName: '4k',
    },
    {
        serial: 2,
        lotteryId: "#649HF013240",
        winningNumbers: [1, 5, 8, 9, 10, 12],
        color: 'yellow',
        time: "12:10 PM, 15 Jan",
        gameName: "5k",
    },
    {
        serial: 3,
        lotteryId: "#649HF013241",
        winningNumbers: [3, 4, 6, 7, 8, 9],
        color: 'red',
        time: "01:05 PM, 15 Jan",
        gameName: "10k",
    },
    {
        serial: 4,
        lotteryId: "#649HF013242",
        winningNumbers: [2, 4, 6, 8, 10, 12],
        color: 'blue',
        time: "02:20 PM, 15 Jan",
        gameName: "12k",
    },
    {
        serial: 4,
        lotteryId: "#649HF016572",
        winningNumbers: [2, 4, 6, 8, 10, 12],
        color: 'orange',
        time: "09:10 PM, 15 Jan",
        gameName: "1k",
    },
];


const SecondComp = () => {

    const [secondsLeft, setSecondsLeft] = useState(24 * 3600 + 23 * 60 + 30 + 56);

    useEffect(() => {
        const t = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    function formatDaysHoursMinutesSeconds(sec) {
        const days = Math.floor(sec / 86400);
        sec %= 86400;
        const hours = Math.floor(sec / 3600);
        sec %= 3600;
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return (
        <AnimationWrapper className='bg-transparent w-full py-13.5 px-7.5 overflow-hidden'>
            <div className=' bg-linear-to-b from-[#0b1220] to-[#071124]/60 shadow-2xl px-12.5 py-15 w-full min-h-75 rounded-[15px] relative borde-[1.4px] borde-[#6b728d] z-0 ring-[1.5px] ring-white/15'>
                <div className='w-100 absolute shadow-2xl flex items-center justify-center left-1/2 -translate-x-1/2 h-12.5 -top-13 rounded-t-[15px] bg-[#0b1220] ring-[1.5px] ring-white/15 border-b-0 z-10'>
                    <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#0b1220]"></div>
                    <div className="absolute left-1/2 -top-2.5 transform -translate-x-1/2 w-72 h-24 rounded-2xl bg-linear-to-r from-[#7c3aed] to-[#06b6d4] opacity-20 blur-xl z-10" />
                    <div className='flex items-center gap-2 absolute -bottom-7 flex-col z-10'>
                        <p className='text-gray-300 text-[12px]/[12px] text-shadow-xs font-medium uppercase tracking-wide'>
                            Next Draw In
                        </p>
                        <div className="countdown text-[40px]/[38px] font-extrabold tracking-[1px]">
                            {formatDaysHoursMinutesSeconds(secondsLeft)}
                        </div>
                    </div>

                </div>


                <div className="w-full flex flex-col gap-2">
                    <div className="grid grid-cols-6 justify-between pb-3.75 px-5 text-white/60 font-normal text-sm relative">
                        <p className="flex-1 px-5 text-start">Serial No</p>
                        <p className="flex-1 px-5 text-center">Lottery ID</p>
                        <p className="flex-1 col-span-2 px-5 text-center">Winning Numbers</p>
                        <p className="flex-1 px-5 text-center">Time</p>
                        <p className="flex-1 px-5 text-end">Winning Amount</p>
                    </div>

                    {dummyData.map((row, index) => (
                        <div
                            key={index}
                            className={`w-full h-12.5 rounded-lg px-5 text-[13px] text-white/70 grid grid-cols-6 items-center gap-2 ${index % 2 === 0 ? "bg-white/5" : "bg-black/0"} relative`}
                        >
                            <div className="px-5 text-start flex-1">{row.serial}</div>
                            <div className="px-5 text-center flex-1">{row.lotteryId}</div>

                            <div className="px-5 col-span-2 flex items-center justify-center gap-2">
                                {row.winningNumbers.map((num, i) => (
                                    <BilliardBall key={i} ballNo={num} color={row?.color} />
                                ))}
                            </div>

                            <div className="px-5 flex-1 text-center">{row.time}</div>
                            <div className="px-5 flex-1 text-end text-white/80  flex items-center justify-end gap-1.5">
                                <AiOutlineDollarCircle className='text-white/70' size={16} />
                                <span className='w-5 text-start'>{row.gameName}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AnimationWrapper>

    )
}

export default SecondComp