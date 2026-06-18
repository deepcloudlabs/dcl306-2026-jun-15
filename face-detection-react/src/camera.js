export async function startCamera(videoElement) {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported by this browser.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "user",
            width: {ideal: 1280},
            height: {ideal: 720},
            frameRate: {ideal: 30, max: 30},
        },
        audio: false,
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    return stream;
}

export function stopCamera(stream) {
    if (!stream) {
        return;
    }

    for (const track of stream.getTracks()) {
        track.stop();
    }
}
