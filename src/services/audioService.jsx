import * as Tone from "tone";

export const audioService = {
  generateAudio: async (notes, filename) => {
    try {
      if (!Array.isArray(notes) || notes.length === 0) {
        throw new Error("No notes provided.");
      }

      const recorder = new Tone.Recorder();
      const synth = new Tone.Synth().connect(recorder);

      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      recorder.start();

      const now = Tone.now();
      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.5);
      });

      await new Promise((resolve) => {
        Tone.Transport.scheduleOnce(() => {
          resolve();
        }, now + notes.length * 0.5 + 0.5);
        Tone.Transport.start();
      });

      const recording = await recorder.stop();

      const url = URL.createObjectURL(recording);
      const anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = url;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(url), 10000);

      return true;
    } catch (error) {
      console.error("Error generating audio:", error);
      throw error;
    }
  },
};
