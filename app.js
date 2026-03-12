const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioCtx();
const pads = Array.from(document.querySelectorAll(".drum-button"));

function createNoiseBuffer(seconds = 0.2) {
  const buffer = audioContext.createBuffer(1, seconds * audioContext.sampleRate, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

const noiseBuffer = createNoiseBuffer();

function envelopeGain(gainNode, start, attack, decay, peak = 1, end = 0.0001) {
  gainNode.gain.cancelScheduledValues(start);
  gainNode.gain.setValueAtTime(end, start);
  gainNode.gain.linearRampToValueAtTime(peak, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(end, start + attack + decay);
}

function playKick() {
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.2);

  envelopeGain(gain, now, 0.001, 0.25, 0.9);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + 0.26);
}

function playSnare() {
  const now = audioContext.currentTime;
  const noise = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();

  noise.buffer = noiseBuffer;
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1200;
  envelopeGain(noiseGain, now, 0.001, 0.12, 0.7);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  noise.start(now);
  noise.stop(now + 0.13);

  const tone = audioContext.createOscillator();
  const toneGain = audioContext.createGain();
  tone.type = "triangle";
  tone.frequency.setValueAtTime(220, now);
  tone.frequency.exponentialRampToValueAtTime(130, now + 0.07);
  envelopeGain(toneGain, now, 0.001, 0.08, 0.3);
  tone.connect(toneGain);
  toneGain.connect(audioContext.destination);
  tone.start(now);
  tone.stop(now + 0.09);
}

function playTom(startFreq, endFreq) {
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.22);
  envelopeGain(gain, now, 0.001, 0.23, 0.85);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + 0.24);
}

function playHat(isOpen = false) {
  const now = audioContext.currentTime;
  const noise = audioContext.createBufferSource();
  const bandpass = audioContext.createBiquadFilter();
  const highpass = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  noise.buffer = noiseBuffer;

  bandpass.type = "bandpass";
  bandpass.frequency.value = 9000;
  bandpass.Q.value = 0.8;

  highpass.type = "highpass";
  highpass.frequency.value = 7000;

  envelopeGain(gain, now, 0.001, isOpen ? 0.24 : 0.07, isOpen ? 0.35 : 0.28);

  noise.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(gain);
  gain.connect(audioContext.destination);
  noise.start(now);
  noise.stop(now + (isOpen ? 0.25 : 0.08));
}

const soundMap = {
  kick: () => playKick(),
  snare: () => playSnare(),
  "tom-low": () => playTom(180, 95),
  "tom-high": () => playTom(260, 145),
  "hat-closed": () => playHat(false),
  "hat-open": () => playHat(true),
};

function activatePad(button) {
  button.classList.add("is-active");
  window.setTimeout(() => {
    button.classList.remove("is-active");
  }, 90);
}

async function playPad(button) {
  const sound = button.dataset.sound;
  const play = soundMap[sound];
  if (!play) {
    return;
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  play();
  activatePad(button);
}

pads.forEach((button) => {
  button.addEventListener("click", () => {
    playPad(button);
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const button = pads.find((pad) => pad.dataset.key === key);
  if (!button || event.repeat) {
    return;
  }
  playPad(button);
});
