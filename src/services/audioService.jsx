import * as Tone from "tone";

export const audioService = {
  generateAudio: async (notes, filename) => {
    try {
      if (!Array.isArray(notes) || notes.length === 0) {
        throw new Error("No notes provided.");
      }

      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      const recorder = new Tone.Recorder();
      const synth = new Tone.Synth().connect(recorder);

      await recorder.start();

      const now = Tone.now();
      const totalDuration = notes.length * 0.5 + 0.2;

      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.5);
      });

      await new Promise((resolve) => setTimeout(resolve, totalDuration * 1000));

      const recording = await recorder.stop();

      synth.dispose();
      recorder.dispose();

      const url = URL.createObjectURL(recording);
      const anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = url;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return true;
    } catch (error) {
      console.error("Error generating audio:", error);
      throw error;
    }
  },
};
