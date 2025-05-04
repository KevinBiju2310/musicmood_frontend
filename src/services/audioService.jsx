import * as Tone from "tone";

export const audioService = {
  generateAudio: (notes, filename = "mood-melody.wav") => {
    return new Promise((resolve, reject) => {
      try {
        const recorder = new Tone.Recorder();
        const synth = new Tone.Synth().connect(recorder);
  
        recorder.start();
  
        Tone.start()
          .then(() => {
            const now = Tone.now();
  
            notes.forEach((note, index) => {
              synth.triggerAttackRelease(note, "8n", now + index * 0.5);
            });
  
            setTimeout(async () => {
              try {
                const recording = await recorder.stop();
  
                const url = URL.createObjectURL(recording);
                const anchor = document.createElement("a");
                anchor.download = filename;
                anchor.href = url;
                anchor.click();
  
                URL.revokeObjectURL(url);
                resolve(true);
              } catch (error) {
                console.error("Error finishing recording:", error);
                reject(error);
              }
            }, notes.length * 500 + 500);
          })
          .catch(error => {
            console.error("Error starting Tone:", error);
            reject(error);
          });
      } catch (error) {
        console.error("Error setting up audio:", error);
        reject(error);
      }
    });
  }
};
