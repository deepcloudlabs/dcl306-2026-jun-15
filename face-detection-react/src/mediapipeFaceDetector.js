import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const WASM_ROOT_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const FACE_DETECTOR_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

export async function createFaceDetector() {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT_URL);

  return FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_DETECTOR_MODEL_URL,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.5,
    minSuppressionThreshold: 0.3,
  });
}
