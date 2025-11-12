import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture, onClear }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      stopCamera();
    }
    try {
      setError(null);
      setPhoto(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    // FIX: Corrected syntax for the catch block.
    } catch (err) {
      setError("Camera access is required. Please enable it in your browser settings.");
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    onClear();
    startCamera();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-inner mb-4">
        {photo ? (
          <img src={photo} alt="Capture" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
        )}
        {error && <div className="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 text-white text-center rounded-xl">{error}</div>}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex space-x-4 h-16 items-center">
        {!photo ? (
          <button 
            onClick={capturePhoto} 
            disabled={!stream} 
            className={`w-16 h-16 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg transition-all transform hover:scale-110 disabled:bg-gray-400 disabled:scale-100 ${!stream ? '' : 'animate-pulse'}`}
            aria-label="Capture photo"
          >
            <span className="text-3xl">📷</span>
          </button>
        ) : (
          <button onClick={retakePhoto} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition flex items-center gap-2">
            <span>🔁</span>
            <span>Retake</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;