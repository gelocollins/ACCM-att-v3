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
      <div className="relative w-full aspect-square bg-black rounded-none overflow-hidden border-2 border-cyan-500/50 mb-4 p-1">
        {photo ? (
          <img src={photo} alt="Capture" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
        )}
        {error && <div className="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80 text-red-400 text-center uppercase tracking-wider">{error}</div>}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex space-x-4 h-20 items-center">
        {!photo ? (
          <button 
            onClick={capturePhoto} 
            disabled={!stream} 
            className="w-20 h-20 rounded-full border-4 border-red-500/50 bg-transparent flex items-center justify-center transition-all transform hover:scale-110 disabled:border-gray-600 disabled:scale-100 group"
            aria-label="Capture photo"
          >
             <div className={`w-16 h-16 rounded-full bg-red-500 group-hover:bg-red-400 transition-colors ${!stream ? '' : 'animate-pulse'}`}></div>
          </button>
        ) : (
          <button onClick={retakePhoto} className="font-bold uppercase tracking-wider text-yellow-300 border-2 border-yellow-300/80 bg-yellow-900/30 hover:bg-yellow-500/30 py-3 px-6 rounded-none transition">
            Retake Scan
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;