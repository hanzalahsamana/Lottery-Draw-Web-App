import { useEffect, useRef, useState } from 'react';
import HeroSection from '../components/HeroSection';
import DrawResults from './../components/DrawResults';
import useGameDraws from '../hooks/useGameDraws';
import { WebLoader } from '../components/WebLoader';
import { gmt8ToLocal } from '../utils/dateUtil';
import { speak } from '../hooks/ttsAnnouncer';
import { Navigate } from 'react-router-dom';

const Game = () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game_id');

    const { last5Draws, setLast5Draws, currentDraw, nextDraw, startDrawOpening, loading, setCurrentDraw, setStartDrawOpening } = useGameDraws(gameId);

    const lotteryRef = useRef();
    const revealIntervalRef = useRef(null);
    const hideTimeoutRef = useRef(null);


    const triggerDraw = (result = ['2', '3', '4', '5', '6', '7']) => {
        const adjustedResult = result.map((num) => Number(num) - 1);
        lotteryRef.current?.startDraw(adjustedResult);
    };

    useEffect(() => {
        if (!startDrawOpening || !startDrawOpening?.drawNo || startDrawOpening?.drawNo !== currentDraw?.drawNo) return;

        const drawNo = startDrawOpening?.drawNo ?? null;
        const resultNo = startDrawOpening.resultNo ?? null;

        if (!drawNo || !resultNo) return;

        if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
        }

        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        triggerDraw(resultNo);

        let idx = 0;
        setCurrentDraw((prev) => ({ ...prev, resultNo: [] }));

        revealIntervalRef.current = setInterval(() => {

            const currentNumber = resultNo[idx];


            if (currentNumber != null) speak(currentNumber);

            setCurrentDraw((prev) => ({
                ...prev,
                resultNo: [...(prev?.resultNo || []), currentNumber],
                status: "opening",
            }));

            idx++;

            if (idx >= resultNo.length) {
                clearInterval(revealIntervalRef.current);
                revealIntervalRef.current = null;

                hideTimeoutRef.current = setTimeout(() => {
                }, 2000);
            }

        }, 3000);

        setLast5Draws((prev) => {
            if (!currentDraw?.drawNo) return prev;

            const exists = prev.some((d) => d.drawNo === currentDraw.drawNo);

            if (exists) return prev;

            return [currentDraw, ...prev].slice(0, 5);
        });

        return () => {
            if (revealIntervalRef.current) {
                clearInterval(revealIntervalRef.current);
                revealIntervalRef.current = null;
            }

            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };

    }, [startDrawOpening]);

    useEffect(() => {
        return () => {
            if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    if (!gameId) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return <WebLoader />;
    }

    return (
        <>
            <div className="fixed w-120 h-80 top-1/2 -translate-y-1/2 -right-8 blur-[180px] rounded-full bg-[#ffffff7d]" />
            {/* <button onClick={() => triggerDraw(['1','2','3','4'])} className='fixed bottom-20 right-20 z-10000000 bg-white px-2 py-1 font-semibold w-max rounded-md cursor-pointer hover:opacity-95' >Click me</button> */}

            <HeroSection
                ref={lotteryRef}
                currentDraw={currentDraw}
            />

            <DrawResults
                nextDraw={nextDraw}
                last5Draws={last5Draws}
            />
        </>
    );
};

export default Game;