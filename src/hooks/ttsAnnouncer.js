// ttsAnnouncer.js

/**
 * Speak numbers using Web Speech API with configurable timing
 * @param {number[]} numbers - Array of numbers to announce
 * @param {object} options - Config options
 * @param {number} options.totalDuration - total duration to finish announcing all numbers (ms)
 * @param {number} options.startDelay - delay before starting (ms)
 * @param {number} options.endDelay - delay after last number (ms)
 * @param {string} options.voiceName - preferred female voice name keyword
 * @param {number} options.volume - 0 to 1
 * @param {number} options.rate - speed of speech
 * @param {number} options.pitch - voice pitch
 */
export const announceNumbers = (
  numbers = [],
  {
    totalDuration = 10000, // default 10s
    startDelay = 1000, // 1 second delay at start
    endDelay = 1000, // 1 second delay at end
    voiceName = 'female',
    volume = 1,
    rate = 0.7,
    pitch = 1,
  } = {},
) => {
  if (!window.speechSynthesis || numbers.length === 0) return;

  const voices = window.speechSynthesis.getVoices();
  const femaleVoice =
    voices.find(
      (voice) =>
        voice.lang.includes('en') &&
        (voice.name.toLowerCase().includes(voiceName) ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('google uk english')),
    ) || voices[0];

  // Calculate the delay between each number
  const totalNumbers = numbers.length;
  const availableTime = totalDuration - startDelay - endDelay;
  const perNumberDelay = availableTime / totalNumbers;

  numbers.forEach((num, index) => {
    const message = new SpeechSynthesisUtterance(num.toString());
    message.voice = femaleVoice;
    message.lang = 'en-US';
    message.volume = volume;
    message.rate = rate;
    message.pitch = pitch;

    const speakTime = startDelay + index * perNumberDelay;
    setTimeout(() => {
      window.speechSynthesis.speak(message);
    }, speakTime);
  });
};
