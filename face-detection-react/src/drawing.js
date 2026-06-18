export function resizeCanvasToVideo(canvas, video) {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
        return false;
    }

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    return true;
}

export function clearCanvas(canvas) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawDetections(canvas, detections) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const detection of detections) {
        drawBoundingBox(context, detection);
        drawKeypoints(context, detection, canvas.width, canvas.height);
    }
}

function drawBoundingBox(context, detection) {
    const box = detection.boundingBox;

    if (!box) {
        return;
    }

    const x = readNumber(box, "originX", "origin_x", "xMin", "xmin") ?? 0;
    const y = readNumber(box, "originY", "origin_y", "yMin", "ymin") ?? 0;
    const width = readNumber(box, "width") ?? 0;
    const height = readNumber(box, "height") ?? 0;
    const score = detection.categories?.[0]?.score;

    context.save();
    context.lineWidth = 4;
    context.strokeStyle = "#00ff88";
    context.fillStyle = "rgba(0, 255, 136, 0.12)";
    context.strokeRect(x, y, width, height);
    context.fillRect(x, y, width, height);

    if (typeof score === "number") {
        const label = `Face ${(score * 100).toFixed(1)}%`;
        context.font = "18px system-ui, sans-serif";
        context.textBaseline = "top";

        const metrics = context.measureText(label);
        const labelWidth = metrics.width + 16;
        const labelHeight = 30;
        const labelY = Math.max(0, y - labelHeight);

        context.fillStyle = "rgba(0, 0, 0, 0.72)";
        context.fillRect(x, labelY, labelWidth, labelHeight);
        context.fillStyle = "#ffffff";
        context.fillText(label, x + 8, labelY + 5);
    }

    context.restore();
}

function drawKeypoints(context, detection, canvasWidth, canvasHeight) {
    const keypoints = detection.keypoints ?? detection.normalizedKeypoints ?? [];

    context.save();
    context.fillStyle = "#ffcc00";

    for (const keypoint of keypoints) {
        const rawX = readNumber(keypoint, "x");
        const rawY = readNumber(keypoint, "y");

        if (typeof rawX !== "number" || typeof rawY !== "number") {
            continue;
        }

        const x = rawX <= 1 ? rawX * canvasWidth : rawX;
        const y = rawY <= 1 ? rawY * canvasHeight : rawY;

        context.beginPath();
        context.arc(x, y, 4, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();
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
