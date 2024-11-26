import { useState } from 'react';

interface VoiceInputProps {
  onTasksCreated: (tasks: string[]) => void;
}

export default function VoiceInput({ onTasksCreated }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          const audioContext = new AudioContext();
          const audioData = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(audioData);
          
          const wavBlob = await new Promise<Blob>((resolve) => {
            const numberOfChannels = audioBuffer.numberOfChannels;
            const length = audioBuffer.length;
            const sampleRate = audioBuffer.sampleRate;
            const wavBuffer = new ArrayBuffer(44 + length * 2);
            const view = new DataView(wavBuffer);
            
            const writeString = (view: DataView, offset: number, string: string) => {
              for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
              }
            };

            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + length * 2, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numberOfChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, numberOfChannels * 2, true);
            view.setUint16(34, 16, true);
            writeString(view, 36, 'data');
            view.setUint32(40, length * 2, true);

            const channelData = audioBuffer.getChannelData(0);
            let offset = 44;
            for (let i = 0; i < length; i++) {
              const sample = channelData[i];
              view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
              offset += 2;
            }

            resolve(new Blob([wavBuffer], { type: 'audio/wav' }));
          });

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              console.log('Sending audio data to server...');
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to transcribe audio');
              }

              const data = await response.json();
              console.log('Server response:', data);
              
              // Handle array of tasks
              if (Array.isArray(data)) {
                // Convert tasks to strings with estimated time
                const taskStrings = data.map(task => 
                  `${task.title} (${task.estimatedTime}min)`
                );
                onTasksCreated(taskStrings);
              } else if (data.title && typeof data.estimatedTime === 'number') {
                // Handle single task
                const taskString = `${data.title} (${data.estimatedTime}min)`;
                onTasksCreated([taskString]);
              } else {
                throw new Error('Invalid task data received from server');
              }
              setTranscript(data.transcript);
            } catch (error) {
              console.error('Error processing audio:', error);
              alert(error instanceof Error ? error.message : 'Error processing audio. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          };
          reader.readAsDataURL(wavBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          alert(error instanceof Error ? error.message : 'Error processing audio. Please try again.');
          setIsProcessing(false);
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopListening = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className="relative w-16 h-16 rounded-full bg-gray-900 hover:bg-black transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isListening ? (
          <div className="relative">
            <div className="absolute -inset-1 bg-white/20 rounded-full animate-ping" />
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      <span className="text-sm font-medium text-gray-600">
        {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Click to speak'}
      </span>
    </div>
  );
}
