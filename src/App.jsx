import React, { useState, useEffect, useRef } from 'react';
    import OpenAI from 'openai';

    function App() {
      const [isRecording, setIsRecording] = useState(false);
      const [transcription, setTranscription] = useState('');
      const mediaRecorder = useRef(null);
      const audioChunks = useRef([]);
      const [debugMessages, setDebugMessages] = useState([]);

      const openaiApiKey = process.env.OPENAI_API_KEY;

      const logDebug = (message) => {
        setDebugMessages((prevMessages) => [...prevMessages, message]);
      };

      useEffect(() => {
        if (isRecording) {
          startRecording();
        } else {
          stopRecording();
        }
      }, [isRecording]);

      const startRecording = async () => {
        logDebug('Starting recording...');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder.current = new MediaRecorder(stream);
          mediaRecorder.current.ondataavailable = (event) => {
            logDebug('Audio data available.');
            audioChunks.current.push(event.data);
          };
          mediaRecorder.current.onstop = async () => {
            logDebug('Recording stopped.');
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            audioChunks.current = [];
            await transcribeAudio(audioBlob);
          };
          mediaRecorder.current.start();
          logDebug('MediaRecorder started.');
        } catch (error) {
          console.error('Error accessing microphone:', error);
          logDebug(`Error accessing microphone: ${error.message}`);
        }
      };

      const stopRecording = () => {
        logDebug('Stopping recording...');
        if (mediaRecorder.current) {
          mediaRecorder.current.stop();
          logDebug('MediaRecorder stopped.');
        }
      };

      const transcribeAudio = async (audioBlob) => {
        logDebug('Starting transcription process...');
        if (!openaiApiKey) {
          console.error('OpenAI API key is missing.  Check your .env file.');
          logDebug('OpenAI API key is missing!');
          return;
        }

        const openai = new OpenAI({ apiKey: openaiApiKey, dangerouslyAllowBrowser: true });
        const audioFile = new File([audioBlob], "audio.webm");

        try {
          logDebug('Calling OpenAI Whisper API...');
          const resp = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
          });
          logDebug('OpenAI Whisper API call successful.');
          setTranscription((prevTranscription) => prevTranscription + resp.text + ' ');
        } catch (error) {
          console.error("Transcription error:", error);
          logDebug(`Transcription error: ${error.message}`);
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
          
            <h2>Debug Log</h2>
            <textarea
              rows="10"
              cols="50"
              value={debugMessages.join('\n')}
              readOnly
            />
          
        </>
      );
    }

    export default App;
