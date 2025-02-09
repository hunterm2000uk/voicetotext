import React, { useState, useRef, useEffect } from 'react';
import { ReactMic } from 'react-mic';
import OpenAI from 'openai';

function App() {
  const [record, setRecord] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [debugLog, setDebugLog] = useState([]);
  const micRef = useRef(null);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const logDebug = (message) => {
    setDebugLog((prevLog) => [...prevLog, message]);
  };

  const startRecording = () => {
    logDebug('Recording started');
    setRecord(true);
    setTranscription('');
  };

  const stopRecording = () => {
    logDebug('Recording stopped');
    setRecord(false);
  };

  const onData = (recordedBlob) => {
    //console.log('chunk of real-time data is: ', recordedBlob);
  };

  const onStop = async (recordedBlob) => {
    logDebug('Audio data received');
    setAudioData(recordedBlob);

    const audioFile = new File([recordedBlob.blob], "audio.wav", { type: "audio/wav" });

    logDebug('Calling OpenAI Whisper API');
    try {
      const resp = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });

      logDebug('Transcription received');
      setTranscription(resp.text);
    } catch (error) {
      logDebug(`Transcription error: ${error.message}`);
      console.error("Transcription error:", error);
    }
  };

  useEffect(() => {
    if (!openai.apiKey) {
      alert("Please set the OPENAI_API_KEY environment variable.");
    }
  }, []);

  return (
    <div className="App">
      <h1>Real-time Audio Transcription</h1>
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        onData={onData}
        strokeColor="#0000FF"
        backgroundColor="#FF4081"
        ref={micRef}
      />
      <button onClick={startRecording} disabled={record}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!record}>
        Stop Recording
      </button>
      <h2>Transcription:</h2>
      <textarea
        value={transcription}
        rows={10}
        cols={50}
        readOnly
      />
      <h2>Debug Log:</h2>
      <textarea
        value={debugLog.join('\n')}
        rows={10}
        cols={50}
        readOnly
      />
    </div>
  );
}

export default App;
