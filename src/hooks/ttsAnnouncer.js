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
