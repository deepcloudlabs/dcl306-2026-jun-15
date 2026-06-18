import { useCallback, useEffect, useRef, useState } from "react";

import { startCamera, stopCamera } from "./camera.js";
import { createFaceDetector } from "./mediapipeFaceDetector.js";
import { clearCanvas, drawDetections, resizeCanvasToVideo } from "./drawing.js";
import { findClosestArchetype, getLargestDetection } from "./archetypeMatcher.js";

const DETECTION_INTERVAL_MS = 80;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);
  const isRunningRef = useRef(false);

  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [closestArchetype, setClosestArchetype] = useState(null);

  const fpsWindowRef = useRef({ startedAt: performance.now(), frames: 0 });

  const stopDetectionLoop = useCallback(() => {
    isRunningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stop = useCallback((nextStatus = "Stopped") => {
    stopDetectionLoop();
    stopCamera(streamRef.current);
    streamRef.current = null;

    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setFaceCount(0);
    setFps(0);
    setClosestArchetype(null);
    setIsRunning(false);
    setStatus(nextStatus);
  }, [stopDetectionLoop]);

  const updateFps = useCallback(() => {
    const now = performance.now();
    const fpsWindow = fpsWindowRef.current;
    fpsWindow.frames += 1;

    const elapsedMs = now - fpsWindow.startedAt;

    if (elapsedMs >= 1000) {
      setFps(Math.round((fpsWindow.frames * 1000) / elapsedMs));
      fpsWindow.startedAt = now;
      fpsWindow.frames = 0;
    }
  }, []);

  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!isRunningRef.current || !video || !canvas || !detector) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(runDetectionLoop);

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    const now = performance.now();

    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
      return;
    }

    lastDetectionTimeRef.current = now;

    if (!resizeCanvasToVideo(canvas, video)) {
      return;
    }

    const result = detector.detectForVideo(video, now);
    const detections = result?.detections ?? [];

    const largestDetection = getLargestDetection(detections);
    const closestMatch = largestDetection
      ? findClosestArchetype(largestDetection, canvas.width, canvas.height)
      : null;
    const matchByDetection = new Map();

    if (largestDetection && closestMatch) {
      matchByDetection.set(largestDetection, closestMatch);
    }

    drawDetections(canvas, detections, matchByDetection);
    setFaceCount(detections.length);
    setClosestArchetype(closestMatch);
    updateFps();
  }, [updateFps]);

  const start = useCallback(async () => {
    try {
      setError("");
      setStatus("Initializing model...");

      if (!detectorRef.current) {
        detectorRef.current = await createFaceDetector();
      }

      setStatus("Requesting camera access...");
      const stream = await startCamera(videoRef.current);
      streamRef.current = stream;

      isRunningRef.current = true;
      setIsRunning(true);
      setStatus("Detecting faces locally in the browser");
      lastDetectionTimeRef.current = 0;
      fpsWindowRef.current = { startedAt: performance.now(), frames: 0 };

      runDetectionLoop();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      stop("Failed");
    }
  }, [runDetectionLoop, stop]);

  useEffect(() => {
    return () => {
      stopDetectionLoop();
      stopCamera(streamRef.current);
      detectorRef.current?.close?.();
    };
  }, [stopDetectionLoop]);

  return (
    <main className="page">
      <section className="panel">
        <div className="toolbar">
          <button type="button" onClick={start} disabled={isRunning}>
            Start camera
          </button>

          <button type="button" onClick={stop} disabled={!isRunning}>
            Stop camera
          </button>
        </div>

        <div className="stats" aria-live="polite">
          <span>Status: {status}</span>
          <span>Faces: {faceCount}</span>
          <span>Detection FPS: {fps}</span>
          <span>Closest archetype: {closestArchetype?.label ?? "None"}</span>
        </div>

        {closestArchetype && (
          <section className="matchCard" aria-live="polite">
            <div>
              <strong>{closestArchetype.label}</strong>
              <p>{closestArchetype.description}</p>
            </div>
            <span>{Math.round(closestArchetype.confidence * 100)}%</span>
          </section>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="cameraStage">
          <video
            ref={videoRef}
            className="cameraVideo"
            muted
            playsInline
            autoPlay
          />
          <canvas ref={canvasRef} className="overlayCanvas" />
        </div>
      </section>
    </main>
  );
}
