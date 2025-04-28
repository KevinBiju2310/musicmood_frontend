import * as Tone from "tone";

export const audioService = {
  generateAudio: async (notes, filename = "mood-melody.wav") => {
    return new Promise(async (resolve, reject) => {
      try {
        const recorder = new Tone.Recorder();
        const synth = new Tone.Synth().connect(recorder);

        recorder.start();

        await Tone.start();
        const now = Tone.now();

        notes.forEach((note, index) => {
          synth.triggerAttackRelease(note, "8n", now + index * 0.5);
        });

        setTimeout(async () => {
          const recording = await recorder.stop();

          const url = URL.createObjectURL(recording);
          const anchor = document.createElement("a");
          anchor.download = filename;
          anchor.href = url;
          anchor.click();

          URL.revokeObjectURL(url);
          resolve(true);
        }, notes.length * 500 + 500);
      } catch (error) {
        console.error("Error generating audio:", error);
        reject(error);
      }
    });
  },
};
