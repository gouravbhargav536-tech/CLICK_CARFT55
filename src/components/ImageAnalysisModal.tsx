import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Sparkles, Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitImageAnalysis: (prompt: string, base64Image: string) => void;
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSubmitImageAnalysis,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('इस चित्र का विस्तार से विश्लेषण करें और बताएं कि इसमें क्या दिखाई दे रहा है। (Describe and analyze this image in detail)');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera access not granted or unavailable.');
      setIsCameraActive(false);
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(base64);
      stopCamera();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImage && prompt.trim()) {
      onSubmitImageAnalysis(prompt.trim(), selectedImage);
      setSelectedImage(null);
      stopCamera();
      onClose();
    }
  };

  const quickPrompts = [
    'इस चित्र का विस्तार से विश्लेषण करें (Detailed Analysis in Hindi)',
    'चित्र में लिखा सारा टेक्स्ट पढ़ें (Extract and Read Text)',
    'इसमें क्या मुख्य वस्तुएं और दृश्य हैं? (Key Objects & Context)',
    'Solve or explain any math/code/diagram shown in this image',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#14141e] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between bg-[#0e0e17]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/40">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Vision Studio</h3>
              <p className="text-[10px] text-purple-300">Multimodal Gemini Vision & Camera</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 bg-[#14141e]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Camera View or Upload Drop Zone */}
          {isCameraActive ? (
            <div className="relative w-full h-52 bg-black rounded-2xl overflow-hidden border-2 border-purple-500/50 flex flex-col items-center justify-center">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current) el.srcObject = streamRef.current;
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/40 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full h-48 rounded-2xl border-2 border-dashed transition-all overflow-hidden relative flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-purple-400 bg-purple-950/40'
                  : 'border-purple-500/40 bg-zinc-900/60 hover:bg-zinc-900/90'
              }`}
            >
              {selectedImage ? (
                <div className="relative w-full h-full group">
                  <img
                    src={selectedImage}
                    alt="Selected preview"
                    className="w-full h-full object-contain bg-black/40"
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-xl border border-purple-500/40 text-xs text-purple-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Image Ready</span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="ml-1 p-0.5 rounded hover:bg-zinc-700 text-zinc-300 hover:text-white"
                      title="Clear image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-center p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-xs font-semibold text-purple-200 flex items-center space-x-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-300" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">or Drag and Drop image here</p>
                  <p className="text-[10px] text-zinc-400">Supports PNG, JPG, WEBP, GIF, Camera snapshots</p>
                </div>
              )}
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-500/30">
              {cameraError}
            </p>
          )}

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-purple-300">Quick Prompt Suggestions</label>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(qp)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-purple-950/60 border border-purple-500/30 text-[10px] text-zinc-300 hover:text-purple-200 transition-all text-left truncate max-w-full"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Prompt Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white">Prompt for AI Analysis</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="What should AetherVoice analyze in this image?"
              className="w-full p-3 rounded-xl bg-zinc-900/90 border border-purple-500/30 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedImage || !prompt.trim()}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-600/30 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Image with AetherVoice AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
