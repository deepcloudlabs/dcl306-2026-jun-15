const ARCHETYPE_DATABASE = [
  {
    id: "front-center",
    label: "Front-facing presenter",
    description: "Centered face, stable webcam framing, strong presentation posture.",
    prototype: {
      aspectRatio: 0.76,
      faceAreaRatio: 0.22,
      centerX: 0.5,
      centerY: 0.48,
      eyeDistanceRatio: 0.24,
    },
  },
  {
    id: "close-up",
    label: "Close-up speaker",
    description: "Large face area in frame, close camera distance, direct communication style.",
    prototype: {
      aspectRatio: 0.78,
      faceAreaRatio: 0.38,
      centerX: 0.5,
      centerY: 0.5,
      eyeDistanceRatio: 0.31,
    },
  },
  {
    id: "wide-frame",
    label: "Wide-frame analyst",
    description: "Smaller face in frame with more environmental context visible.",
    prototype: {
      aspectRatio: 0.72,
      faceAreaRatio: 0.08,
      centerX: 0.5,
      centerY: 0.44,
      eyeDistanceRatio: 0.14,
    },
  },
  {
    id: "left-offset",
    label: "Left-composed profile",
    description: "Face composition is shifted to the left side of the camera frame.",
    prototype: {
      aspectRatio: 0.74,
      faceAreaRatio: 0.2,
      centerX: 0.34,
      centerY: 0.48,
      eyeDistanceRatio: 0.23,
    },
  },
  {
    id: "right-offset",
    label: "Right-composed profile",
    description: "Face composition is shifted to the right side of the camera frame.",
    prototype: {
      aspectRatio: 0.74,
      faceAreaRatio: 0.2,
      centerX: 0.66,
      centerY: 0.48,
      eyeDistanceRatio: 0.23,
    },
  },
  {
    id: "high-frame",
    label: "High-frame anchor",
    description: "Face sits higher in the image, similar to a formal webcam framing.",
    prototype: {
      aspectRatio: 0.76,
      faceAreaRatio: 0.2,
      centerX: 0.5,
      centerY: 0.36,
      eyeDistanceRatio: 0.22,
    },
  },
];

const FEATURE_WEIGHTS = {
  aspectRatio: 0.9,
  faceAreaRatio: 1.3,
  centerX: 1.1,
  centerY: 1.0,
  eyeDistanceRatio: 0.9,
};

export function findClosestArchetype(detection, canvasWidth, canvasHeight) {
  const features = extractNonIdentifyingFeatures(detection, canvasWidth, canvasHeight);

  if (!features) {
    return null;
  }

  let bestCandidate = null;

  for (const archetype of ARCHETYPE_DATABASE) {
    const distance = weightedDistance(features, archetype.prototype);
    const confidence = Math.max(0, 1 - distance / 0.8);

    if (!bestCandidate || distance < bestCandidate.distance) {
      bestCandidate = {
        id: archetype.id,
        label: archetype.label,
        description: archetype.description,
        distance,
        confidence,
        features,
      };
    }
  }

  return bestCandidate;
}

export function getLargestDetection(detections) {
  return detections.reduce((largest, current) => {
    const largestArea = getBoxArea(largest?.boundingBox);
    const currentArea = getBoxArea(current?.boundingBox);

    return currentArea > largestArea ? current : largest;
  }, null);
}

function extractNonIdentifyingFeatures(detection, canvasWidth, canvasHeight) {
  const box = detection?.boundingBox;

  if (!box || !canvasWidth || !canvasHeight) {
    return null;
  }

  const x = readNumber(box, "originX", "origin_x", "xMin", "xmin") ?? 0;
  const y = readNumber(box, "originY", "origin_y", "yMin", "ymin") ?? 0;
  const width = readNumber(box, "width") ?? 0;
  const height = readNumber(box, "height") ?? 0;

  if (!width || !height) {
    return null;
  }

  const keypoints = detection.keypoints ?? detection.normalizedKeypoints ?? [];
  const eyeDistanceRatio = estimateEyeDistanceRatio(keypoints, width, canvasWidth);

  return {
    aspectRatio: clamp(width / height, 0, 2),
    faceAreaRatio: clamp((width * height) / (canvasWidth * canvasHeight), 0, 1),
    centerX: clamp((x + width / 2) / canvasWidth, 0, 1),
    centerY: clamp((y + height / 2) / canvasHeight, 0, 1),
    eyeDistanceRatio,
  };
}

function weightedDistance(features, prototype) {
  let total = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(FEATURE_WEIGHTS)) {
    const value = features[key];
    const expected = prototype[key];

    if (typeof value !== "number" || typeof expected !== "number") {
      continue;
    }

    total += Math.abs(value - expected) * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? Number.POSITIVE_INFINITY : total / totalWeight;
}

function estimateEyeDistanceRatio(keypoints, boxWidth, canvasWidth) {
  if (!Array.isArray(keypoints) || keypoints.length < 2 || !boxWidth) {
    return 0.22;
  }

  const first = readPoint(keypoints[0], canvasWidth);
  const second = readPoint(keypoints[1], canvasWidth);

  if (!first || !second) {
    return 0.22;
  }

  return clamp(Math.abs(first.x - second.x) / boxWidth, 0, 1);
}

function readPoint(point, canvasWidth) {
  const rawX = readNumber(point, "x");
  const rawY = readNumber(point, "y");

  if (typeof rawX !== "number" || typeof rawY !== "number") {
    return null;
  }

  return {
    x: rawX <= 1 ? rawX * canvasWidth : rawX,
    y: rawY,
  };
}

function getBoxArea(box) {
  if (!box) {
    return 0;
  }

  const width = readNumber(box, "width") ?? 0;
  const height = readNumber(box, "height") ?? 0;

  return width * height;
}

function readNumber(source, ...keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
