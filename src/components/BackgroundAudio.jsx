import React, { useEffect, useRef, useState } from "react";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";

const BackgroundAudio = ({ audioUrl = '/backgoundAudio.mp3' }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // create audio
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.15;
        const startAudio = () => {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(console.log);
            // remove listener after first interaction
            window.removeEventListener("click", startAudio);
            window.removeEventListener("touchstart", startAudio);
        };

        // listen for first interaction
        window.addEventListener("click", startAudio);
        window.addEventListener("touchstart", startAudio);

        return () => {
            audioRef.current.pause();
            window.removeEventListener("click", startAudio);
            window.removeEventListener("touchstart", startAudio);
        };
    }, [audioUrl]);

    // useEffect(()=>{
    //     toggleAudio()
    // },[])

    const toggleAudio = () => {
        if (!audioRef.current) return;

        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();

        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed top-5 left-5 cursor-pointer z-30">
            <div className="text-[24px] text-white" onClick={toggleAudio}>
                {isPlaying ? <HiOutlineSpeakerWave strokeWidth={1.8} size={30} /> : <HiOutlineSpeakerXMark strokeWidth={1.8} size={30} />}
            </div>
        </div>
    );
};

export default BackgroundAudio;
