import React, { useState, useEffect, useRef } from 'react';
    import { GoogleGenerativeAI } from "@google/generative-ai";

    function App() {
      const [isRecording, setIsRecording] = useState(false);
      const [transcription, setTranscription] = useState('');
      const mediaRecorder = useRef(null);
      const audioChunks = useRef([]);

      const geminiApiKey = process.env.GEMINI_API_KEY;

      useEffect(() => {
        if (isRecording) {
          startRecording();
        } else {
          stopRecording();
        }
      }, [isRecording]);

      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder.current = new MediaRecorder(stream);
          mediaRecorder.current.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
          };
          mediaRecorder.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            audioChunks.current = [];
            await transcribeAudio(audioBlob);
          };
          mediaRecorder.current.start();
        } catch (error) {
          console.error('Error accessing microphone:', error);
        }
      };

      const stopRecording = () => {
        if (mediaRecorder.current) {
          mediaRecorder.current.stop();
        }
      };

      const transcribeAudio = async (audioBlob) => {
        if (!geminiApiKey) {
          console.error('Gemini API key is missing.  Check your .env file.');
          return;
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const audioData = await blobToBase64(audioBlob);

        async function blobToBase64(blob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.onabort = () => reject(new Error("Read aborted"));
            reader.readAsDataURL(blob);
          });
        }

        const prompt = "Transcribe the following audio:";

        const request = {
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "audio/webm",
                  data: audioData.split(',')[1]
                }
              },
            ],
          }],
        };

        try {
          const response = await model.generateContent(request);
          const text = response.response.text();
          setTranscription((prevTranscription) => prevTranscription + text + ' ');
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };

      const toggleRecording = () => {
        setIsRecording((prevState) => !prevState);
      };

      return (
        <>
          <h1>Realtime Audio Transcription</h1>
          <button onClick={toggleRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <textarea
            rows="10"
            cols="50"
            value={transcription}
            readOnly
          />
        </>
      );
    }

    export default App;
