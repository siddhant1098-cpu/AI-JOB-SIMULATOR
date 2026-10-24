import { useRef, useState, useCallback, useEffect } from 'react';

const DETECT_INTERVAL_MS = 500;
const NO_FACE_THRESHOLD_MS = 1500;
const DARK_THRESHOLD = 30; // avg brightness below this = dark frame

/**
 * useCamera — MediaPipe face detection + real-time mobile phone detection anti-cheat
 *
 * Returns:
 *   videoRef        – attach to <video> element
 *   canvasRef       – hidden canvas for brightness check
 *   startCamera()   – request permission and start video stream
 *   stopCamera()    – stop stream
 *   cameraReady     – boolean
 *   cameraError     – string|null
 *   isBlurred       – boolean (blur the screen)
 *   blurReason      – string explaining why it's blurred
 *   flags           – array of logged flag events
 *   faceCount       – current detected face count
 *   phoneDetected   – boolean (mobile phone in camera frame)
 *   detectorLoaded  – boolean
 */
export function useCamera(onFlag, strictMode = true) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const internalCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const objectDetectorRef = useRef(null);
  const intervalRef = useRef(null);
  const noFaceTimerRef = useRef(null);
  const lastFlagTimesRef = useRef({});

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [blurReason, setBlurReason] = useState('');
  const [flags, setFlags] = useState([]);
  const [faceCount, setFaceCount] = useState(1);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [detectorLoaded, setDetectorLoaded] = useState(false);

  // Debounced flag logger: avoid spamming duplicate events within 5 seconds
  const addFlag = useCallback((reason) => {
    const now = Date.now();
    const lastTime = lastFlagTimesRef.current[reason] || 0;
    if (now - lastTime < 5000) return; // cooldown 5s
    lastFlagTimesRef.current[reason] = now;

    const entry = `${new Date().toLocaleTimeString()} – ${reason}`;
    setFlags((f) => [...f, entry]);
    if (onFlag) onFlag(entry);
  }, [onFlag]);

  const triggerBlur = useCallback((reason) => {
    if (!strictMode) return;
    setIsBlurred(true);
    setBlurReason(reason);
  }, [strictMode]);

  const clearBlur = useCallback(() => {
    setIsBlurred(false);
    setBlurReason('');
  }, []);

  // Average pixel brightness on a small canvas sample to detect covered lens
  const checkBrightness = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return true;
    let canvas = canvasRef.current;
    if (!canvas) {
      if (!internalCanvasRef.current) {
        internalCanvasRef.current = document.createElement('canvas');
      }
      canvas = internalCanvasRef.current;
    }
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 48;
    ctx.drawImage(video, 0, 0, 64, 48);
    const data = ctx.getImageData(0, 0, 64, 48).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avg = sum / (data.length / 4);
    return avg > DARK_THRESHOLD;
  }, []);

  // Load MediaPipe FaceDetector and ObjectDetector (for mobile phone detection)
  const loadDetectors = useCallback(async () => {
    try {
      const { FaceDetector, ObjectDetector, FilesetResolver } =
        await import('@mediapipe/tasks-vision');
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
      );

      // 1. Face Detector
      try {
        const faceDetector = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        });
        faceDetectorRef.current = faceDetector;
      } catch (err) {
        console.warn('Face detector load warning (trying CPU):', err);
        const faceDetector = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        });
        faceDetectorRef.current = faceDetector;
      }

      // 2. Object Detector for Mobile Phones (COCO classes includes "cell phone")
      try {
        const objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
            delegate: 'GPU',
          },
          scoreThreshold: 0.35,
          runningMode: 'VIDEO',
        });
        objectDetectorRef.current = objectDetector;
      } catch (objErr) {
        console.warn('Object detector load warning (trying CPU):', objErr);
        try {
          const objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
              delegate: 'CPU',
            },
            scoreThreshold: 0.35,
            runningMode: 'VIDEO',
          });
          objectDetectorRef.current = objectDetector;
        } catch (e2) {
          console.warn('Could not load object detector on CPU:', e2);
        }
      }

      setDetectorLoaded(true);
    } catch (e) {
      console.warn('MediaPipe detectors failed to initialize (vision anti-cheat will use fallback):', e);
    }
  }, []);

  const runDetection = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !cameraReady) return;
    const now = performance.now();

    // 1. Dark frame check
    const bright = checkBrightness();
    if (!bright) {
      triggerBlur('Camera covered or in dark environment');
      addFlag('Dark frame detected (camera potentially covered)');
      return;
    }

    let phoneFound = false;

    // 2. Object detection: check for mobile phones in frame
    if (objectDetectorRef.current) {
      try {
        const objResult = objectDetectorRef.current.detectForVideo(video, now);
        if (objResult.detections && objResult.detections.length > 0) {
          for (const det of objResult.detections) {
            for (const cat of det.categories) {
              const name = (cat.categoryName || '').toLowerCase();
              if (name === 'cell phone' || name === 'phone' || name === 'mobile phone') {
                phoneFound = true;
                break;
              }
            }
            if (phoneFound) break;
          }
        }
      } catch (e) {
        // non-blocking
      }
    }

    setPhoneDetected(phoneFound);

    if (phoneFound) {
      triggerBlur('📱 Mobile Phone Detected! Mobile phones are prohibited in Strict Mode. Remove your phone to proceed.');
      addFlag('Mobile phone detected in camera frame');
      return;
    }

    // 3. Face detection: face visibility & multi-face check
    if (faceDetectorRef.current) {
      try {
        const faceResult = faceDetectorRef.current.detectForVideo(video, now);
        const count = faceResult.detections?.length ?? 0;
        setFaceCount(count);

        if (count > 1) {
          clearTimeout(noFaceTimerRef.current);
          triggerBlur('Multiple faces detected in frame');
          addFlag('Multiple faces detected');
          return;
        }

        if (count === 0) {
          if (!noFaceTimerRef.current) {
            noFaceTimerRef.current = setTimeout(() => {
              triggerBlur('No face visible — please stay in frame');
              addFlag('Face not visible');
              noFaceTimerRef.current = null;
            }, NO_FACE_THRESHOLD_MS);
          }
          return;
        }

        // Face is visible and single, and no phone detected
        clearTimeout(noFaceTimerRef.current);
        noFaceTimerRef.current = null;
        clearBlur();
      } catch (e) {
        console.warn('Face detection error:', e);
      }
    } else {
      // Fallback if model failed to load
      clearBlur();
    }
  }, [checkBrightness, triggerBlur, clearBlur, addFlag, cameraReady]);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera mediaDevices API is not available (browser context may not be secure).');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraReady(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        videoRef.current.play().catch((err) => {
          console.warn('Video auto-playback warning:', err);
        });
      }

      try {
        await loadDetectors();
      } catch (detErr) {
        console.warn('Detector loader caught:', detErr);
      }

      intervalRef.current = setInterval(runDetection, DETECT_INTERVAL_MS);
    } catch (e) {
      console.warn('startCamera error:', e);
      setCameraError(e.message || 'Camera access denied');
      setCameraReady(false);
    }
  }, [loadDetectors, runDetection]);

  const stopCamera = useCallback(() => {
    clearInterval(intervalRef.current);
    clearTimeout(noFaceTimerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Continuously ensure videoRef element is connected to the active stream
  useEffect(() => {
    if (cameraReady && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        videoRef.current.play().catch(() => {});
      }
    }
  });

  // Restart detection loop once detector loads
  useEffect(() => {
    if (cameraReady && (faceDetectorRef.current || objectDetectorRef.current)) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runDetection, DETECT_INTERVAL_MS);
    }
  }, [cameraReady, detectorLoaded, runDetection]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    cameraReady,
    cameraError,
    isBlurred,
    blurReason,
    flags,
    faceCount,
    phoneDetected,
    detectorLoaded,
    addFlag,
    triggerBlur,
    clearBlur,
  };
}
