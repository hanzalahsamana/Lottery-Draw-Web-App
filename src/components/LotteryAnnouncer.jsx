import React, { useEffect } from "react";

const LotteryAnnouncerGirl = ({ numbers = [], autoAnnounce = false, delay = 500 }) => {

    const announceNumbers = (numbersToAnnounce) => {
        if (!window.speechSynthesis || numbersToAnnounce.length === 0) return;

        const voices = window.speechSynthesis.getVoices();

        // Try to find a female English voice
        const femaleVoice =
            voices.find(voice =>
                voice.lang.includes("en") && (
                    voice.name.toLowerCase().includes("zira") ||
                    voice.name.toLowerCase().includes("female") ||
                    voice.name.toLowerCase().includes("susan") ||
                    voice.name.toLowerCase().includes("google uk english"))
            ) || voices[0]; // fallback to first voice

        // Speak each number with delay
        numbersToAnnounce.forEach((num, index) => {
            const message = new SpeechSynthesisUtterance(num.toString());
            message.voice = femaleVoice;
            message.lang = "en-US";
            message.volume = 1;
            message.rate = 0.7;
            message.pitch = 1;

            setTimeout(() => {
                window.speechSynthesis.speak(message);
            }, index * delay); // 0.5s delay between numbers
        });
    };

    useEffect(() => {
        // Wait for voices to load, then auto announce
        const handleVoicesChanged = () => {
            if (autoAnnounce) announceNumbers(numbers);
        };

        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [autoAnnounce, numbers]);

    return (
        <div>
            <button
                onClick={() => announceNumbers(numbers)}
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
                Announce Numbers
            </button>
        </div>
    );
};

export default LotteryAnnouncerGirl;
