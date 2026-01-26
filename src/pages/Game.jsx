import { useEffect, useRef, useState } from 'react';
import HeroSection from '../components/HeroSection';
import DrawResults from './../components/DrawResults';
import useGameDraws from '../hooks/useGameDraws';
import { WebLoader } from '../components/WebLoader';
import { gmt8ToLocal } from '../utils/dateUtil';
import BilliardBall from '../components/BilliardBall';
import { AnimatePresence, motion } from 'framer-motion';
import { speak } from '../hooks/ttsAnnouncer';

const Game = () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game_id');

    const { gameMeta, lastDraws, init, loading, lotteryLoading } = useGameDraws(gameId);
    const gameInstance = gameMeta?.gameInstance?.[0];

    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isSelling, setIsSelling] = useState(false);
    const [sellStartTime, setSellStartTime] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [revealedCount, setRevealedCount] = useState(0);

    const triggeredRef = useRef(false);
    const revealIntervalRef = useRef(null);
    const hideTimeoutRef = useRef(null);
    const [firstFetchDone, setFirstFetchDone] = useState(false);
    const lotteryRef = useRef();


    const triggerDraw = (result = [1, 4, 6, 8, 10, 12]) => {
        lotteryRef.current?.startDraw(result);
    };

    useEffect(() => {
        if (!loading && gameMeta) {
            setFirstFetchDone(true);
        }
    }, [loading, gameMeta]);

    useEffect(() => {
        if (!gameInstance) return;

        const startTimeStr = gameInstance.startSellingTime;
        const endTimeStr = gameInstance.endSellingTime;

        if (!startTimeStr || !endTimeStr) return;

        const startTime = new Date(gmt8ToLocal(startTimeStr));
        const endTime = new Date(new Date(gmt8ToLocal(endTimeStr)).getTime() + 60 * 1 * 1000);

        setSellStartTime(startTime);

        const now = new Date();

        // ❌ Selling not started OR already ended
        if (now < startTime || now >= endTime) {
            setIsSelling(false);
            setSecondsLeft(0);
            return;
        }

        // ✅ Selling active
        setIsSelling(true);

        const calcSecondsLeft = () => {
            const diff = Math.floor((endTime - new Date()) / 1000);
            return diff > 0 ? diff : 0;
        };

        setSecondsLeft(calcSecondsLeft());
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsSelling(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameInstance]);

    useEffect(() => {
        if (!firstFetchDone) return;
        // only trigger after first fetch and when secondsLeft hits 0
        if (!lotteryLoading && secondsLeft === 0 && !triggeredRef.current) {
            triggeredRef.current = true;
            setIsActive(true);
            setRevealedCount(0);

            // fetch fresh data
            init(false);

            // safety: auto-hide bar if fetch takes too long
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = setTimeout(() => {
                setIsActive(false);
                triggeredRef.current = false;
                setRevealedCount(0);
            }, 20000);
        }
    }, [secondsLeft, lotteryLoading, firstFetchDone, init]);

    useEffect(() => {
        // only start reveal when bar is active and fetching is done
        if (!isActive) return;

        // still loading - show loader (do nothing)
        if (lotteryLoading) return;

        // fetch finished — compute numbers
        const raw = lastDraws?.[0]?.resultNo ?? '';
        const parsed = (raw && typeof raw === 'string')
            ? raw.split(',').map(s => {
                const t = parseInt(s.trim(), 10);
                return Number.isNaN(t) ? null : t;
            }).filter(Boolean)
            : [];

        // fallback to default six numbers if parsing fails
        const numbers = parsed.length === 6 ? parsed : Array.from({ length: 6 }, (_, i) => i + 2);

        // clear any previous interval
        if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
        }
        setRevealedCount(0);

        console.log("🚀 ~ Game ~ parsed:", parsed)
        triggerDraw(parsed)

        let idx = 0;
        revealIntervalRef.current = setInterval(() => {
            // reveal current ball
            setRevealedCount(idx + 1);

            // announce the current number
            const currentNumber = numbers[idx];
            if (currentNumber != null) speak(currentNumber);

            idx += 1;

            if (idx >= numbers.length) {
                clearInterval(revealIntervalRef.current);
                revealIntervalRef.current = null;

                // hide the bar after 2s
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = setTimeout(() => {
                    setIsActive(false);
                    triggeredRef.current = false;
                    setRevealedCount(0);
                }, 2000);
            }
        }, 3000); // delay between each ball (change 2000 to your preferred ms)

        // cleanup on unmount or dependencies change
        return () => {
            if (revealIntervalRef.current) {
                clearInterval(revealIntervalRef.current);
                revealIntervalRef.current = null;
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [lotteryLoading, isActive, lastDraws]);

    useEffect(() => {
        return () => {
            if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);


    if (!gameId) {
        return (
            <div className="text-red-500 text-xl p-10">
                game_id missing in URL
            </div>
        );
    }

    if (loading) {
        return <WebLoader />;
    }

    return (
        <>
            <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#c70be479]"></div>

            <HeroSection
                secondsLeft={secondsLeft}
                isSelling={isSelling}
                sellStartTime={sellStartTime}
                gameMeta={gameInstance}
                ref={lotteryRef}
            />

            <DrawResults
                secondsLeft={secondsLeft}
                draws={lastDraws}
                metadata={gameMeta}
                isSelling={isSelling}
            />


            <AnimatePresence mode="wait">
                {isActive && (
                    <motion.div

                        key="toolbar"
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ duration: 0.30, ease: "easeOut" }}
                        className="fixed flex px-4 items-center justify-evenly rounded-lg top-7 left-1/2 -translate-x-1/2 w-[300px] h-[50px] bg-[#0b1220]"
                    >
                        <div className="absolute w-[1px] h-[30px] -top-[30px] left-4 bg-gray-700" />
                        <div className="absolute w-[4px] h-[4px] top-[10px] left-[14px] bg-gray-700 rounded-full" />
                        <div className="absolute w-[4px] h-[4px] top-[10px] right-[14px] bg-gray-700 rounded-full" />
                        <div className="absolute w-[1.5px] h-[30px] -top-[30px] right-4 bg-gray-700" />
                        {/* <p className='text-white/80 text-[10px] absolute top-0.5 left-10'>Result For #0129392</p> */}
                        {lotteryLoading ? (
                            <p className='text-white/70 text-xs'>Loading Result...</p>
                        ) : (
                            (() => {
                                const raw = lastDraws?.[0]?.resultNo ?? '';
                                const parsed = (raw && typeof raw === 'string')
                                    ? raw.split(',').map(s => {
                                        const t = parseInt(s.trim(), 10);
                                        return Number.isNaN(t) ? null : t;
                                    }).filter(Boolean)
                                    : [];
                                const numbers = parsed.length === 6 ? parsed : Array.from({ length: 6 }, (_, i) => i + 2);

                                return numbers.map((num, i) => (
                                    <div key={i} className="w-[30px] h-[30px] flex items-center  justify-center rounded-full bg-gray-800">
                                        {i < revealedCount ? (
                                            <BilliardBall ballNo={num} className={'scale-[1] origin-enter'} />
                                        ) : null}
                                    </div>
                                ));
                            })()
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Game;
