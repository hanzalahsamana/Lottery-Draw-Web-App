import { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import DrawResults from './../components/DrawResults';
import useGameDraws from '../hooks/useGameDraws';
import { WebLoader } from '../components/WebLoader';
import { gmt8ToLocal } from '../utils/dateUtil';

const Game = () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game_id');

    const { gameMeta, lastDraws, loading } = useGameDraws(gameId);

    const gameInstance = gameMeta?.gameInstance?.[0];

    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isSelling, setIsSelling] = useState(false);
    const [sellStartTime, setSellStartTime] = useState(null);

    useEffect(() => {
        if (!gameInstance) return;

        const startTimeStr = gameInstance.startSellingTime;
        const endTimeStr = gameInstance.endSellingTime;

        if (!startTimeStr || !endTimeStr) return;

        const startTime = new Date(gmt8ToLocal(startTimeStr));
        const endTime = new Date(gmt8ToLocal(endTimeStr));

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

    if (!gameId) {
        return (
            <div className="text-red-500 text-xl p-10">
                ❌ game_id missing in URL
            </div>
        );
    }

    if (loading) {
        return <WebLoader />;
    }

    return (
        <>
            <div className="fixed w-200 h-50 top-1/2 -translate-y-1/2 -right-25 blur-[180px] rounded-full bg-[#0b74e479]"></div>

            <HeroSection
                secondsLeft={secondsLeft}
                isSelling={isSelling}
                sellStartTime={sellStartTime}
            />

            <DrawResults
                secondsLeft={secondsLeft}
                draws={lastDraws}
                metadata={gameMeta}
                isSelling={isSelling}
            />
        </>
    );
};

export default Game;
