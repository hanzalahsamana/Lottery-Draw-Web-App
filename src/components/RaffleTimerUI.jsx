import React, { useEffect, useState } from "react";

// Single-file React + Tailwind component. Drop into any React project that already
// has Tailwind configured. Default export is the component previewed in the canvas.

export default function RaffleTimerUI() {
    // initial countdown in seconds (1 day + 23:30:56 as an example)
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
        return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    const rows = [
        {
            player: "winzy_009",
            ticket: "#32044934",
            winningNumbers: [1, 6, 5, 6, 2, 2],
            usersNumbers: [1, 6, 2, 9, 0, 0],
            amount: "109.2K",
        },
        {
            player: "mahdi_22",
            ticket: "#32044935",
            winningNumbers: [2, 3, 4, 1, 8, 7],
            usersNumbers: [2, 3, 4, 1, 8, 7],
            amount: "52.1K",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-[#06102200] flex items-center justify-center">
            <div className="relative w-full max-w-5xl">
                {/* large decorative circle that OVERFLOWS the main container */}
                {/* <div className="pointer-events-none absolute -top-40 left-1/2 transform -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#06b6d4] opacity-80 blur-3xl" /> */}

                <div className="relative bg-gradient-to-b from-[#0b1220] to-[#071124]/60 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                    {/* Header / Countdown area */}
                    <div className="relative z-10 px-8 pt-12 pb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-300 text-sm uppercase tracking-wide">Next Draw</h3>
                                <h2 className="text-white text-3xl font-extrabold mt-1">Raffle Countdown</h2>
                            </div>

                            {/* Timer pill */}
                            <div className="relative -translate-y-6">
                                <div className="flex items-center gap-4 bg-gradient-to-r from-[#111827] to-[#0b1220] px-5 py-3 rounded-full shadow-lg ring-1 ring-white/6">
                                    <div className="text-xs text-gray-400 uppercase mr-2">Time left</div>
                                    <div className="bg-[#0f1724] px-4 py-2 rounded-full shadow-inner flex items-center text-white font-mono text-lg tracking-wider">
                                        {formatDaysHoursMinutesSeconds(secondsLeft)}
                                    </div>
                                </div>

                                {/* small glow behind timer to accent overflow */}
                                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/3 w-72 h-24 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] opacity-20 blur-xl -z-10" />
                            </div>
                        </div>

                        {/* decorative thin pill under header */}
                        <div className="mt-8">
                            <div className="h-1 w-3/4 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] opacity-30" />
                        </div>
                    </div>

                    {/* rows */}
                    <div className="px-6 pb-8">
                        <div className="mt-6 grid gap-4">
                            {rows.map((r, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-[#071226]/60 rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        {/* avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#111827] to-[#0b1220] flex items-center justify-center ring-1 ring-white/6">
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="12" cy="8" r="3" fill="#94a3b8" />
                                                <path d="M6 20c0-3.3137 2.6863-6 6-6s6 2.6863 6 6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-100 font-semibold">{r.player}</div>
                                            <div className="text-xs text-gray-400">{r.ticket}</div>
                                        </div>
                                    </div>

                                    <div className="flex-1 px-4">
                                        <div className="flex items-center gap-2 justify-center">
                                            {/* winning numbers */}
                                            <div className="flex gap-2 bg-transparent">
                                                {r.winningNumbers.map((n, i) => (
                                                    <div key={i} className="px-3 py-1 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white font-semibold text-sm shadow-sm ring-1 ring-white/10">
                                                        {n}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* separator */}
                                            <div className="mx-4 h-8 w-px bg-gradient-to-b from-white/6 to-transparent" />

                                            {/* users numbers */}
                                            <div className="flex gap-2">
                                                {r.usersNumbers.map((n, i) => (
                                                    <div key={i} className="px-3 py-1 rounded-full bg-[#0b1220] text-gray-300 font-medium text-sm ring-1 ring-white/4">
                                                        {n}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-300">Winning amount</div>
                                            <div className="text-white font-bold">{r.amount}</div>
                                        </div>

                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-400 flex items-center justify-center text-black font-bold shadow-md">₹</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* bottom small instruction */}
                <div className="mt-6 text-center text-xs text-gray-500">Design recreated with Tailwind — timer background intentionally overflows the main container.</div>
            </div>
        </div>
    );
}
