import * as Tone from "tone";

export const audioService = {
    generateAudio: async (notes, filename) => {
        try {
          if (!Array.isArray(notes) || notes.length === 0) {
            throw new Error("No notes provided.");
          }
      
          // Start audio context if needed
          if (Tone.context.state !== "running") {
            await Tone.start();
          }
      
          // Create recorder and synth
          const recorder = new Tone.Recorder();
          const synth = new Tone.Synth().connect(recorder);
          
          // Start recording
          await recorder.start();
          
          // Play notes with precise timing
          const now = Tone.now();
          const totalDuration = notes.length * 0.5 + 0.2; // Add a small buffer
          
          notes.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", now + index * 0.5);
          });
      
          // Wait for the sequence to complete
          await new Promise(resolve => setTimeout(resolve, totalDuration * 1000));
          
          // Stop recording and get the blob
          const recording = await recorder.stop();
          
          // Clean up
          synth.dispose();
          recorder.dispose();
          
          // Create download
          const url = URL.createObjectURL(recording);
          const anchor = document.createElement("a");
          anchor.download = filename;
          anchor.href = url;
          anchor.click();
      
          // Clean up the URL object after download starts
          setTimeout(() => URL.revokeObjectURL(url), 1000);
      
          return true;
        } catch (error) {
          console.error("Error generating audio:", error);
          throw error;
        }
      }
};
