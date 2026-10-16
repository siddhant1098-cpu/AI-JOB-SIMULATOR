import React, { useEffect } from 'react';

/**
 * CameraPreview — Minimal Pastel Floating Camera Widget
 */
export default function CameraPreview({ camera, strictMode = true }) {
  const { videoRef, startCamera, cameraReady, cameraError, faceCount, phoneDetected } = camera;

  useEffect(() => {
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-30">
      <div
        className={`relative rounded-3xl overflow-hidden border-2 bg-stone-100 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${
          phoneDetected
            ? 'border-rose-400 ring-4 ring-rose-200 animate-pulse'
            : 'border-white/90'
        }`}
        style={{ width: 165, height: 120 }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Status badges header */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
            <div
              className={`w-1.5 h-1.5 rounded-full ${cameraReady ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse`}
            />
            {cameraReady && (
              <span className="text-[10px] text-stone-700 font-semibold">
                {faceCount === 0 ? '⚠️ 0' : faceCount === 1 ? '👤 1' : `👥 ${faceCount}`}
              </span>
            )}
          </div>

          {cameraReady && (
            <div>
              {phoneDetected ? (
                <span className="text-[9px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  📱 PHONE!
                </span>
              ) : (
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-medium">
                  ✓ Clean
                </span>
              )}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-md text-center py-1 flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-medium border-t border-stone-100">
          <span>🔒 On-Device AI</span>
          {strictMode && <span className="text-purple-600 font-bold">• Strict</span>}
        </div>

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 bg-stone-50/95 flex items-center justify-center p-3 text-center">
            <p className="text-[11px] text-rose-600 font-medium leading-tight">{cameraError}</p>
          </div>
        )}

        {/* Pre-start overlay */}
        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 bg-stone-100/90 backdrop-blur-xs flex items-center justify-center">
            <button
              onClick={startCamera}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline"
            >
              Start Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
