import React, {useEffect, useRef, useState} from 'react';
import * as faceapi from '@vladmandic/face-api';

const App = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [engineState, setEngineState] = useState({loaded: false, status: 'Initializing neural weights...'});
    const [matchResult, setMatchResult] = useState({label: 'No face detected', distance: null});
    const faceMatcherRef = useRef(null);
    const animationFrameId = useRef(null);

    useEffect(() => {
        const initializeExecutionPipeline = async () => {
            try {
                // Utilizing a validated public CDN to load weights client-side without local storage overhead
                const MODEL_URI = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

                setEngineState({loaded: false, status: 'Loading SSD Mobilenet V1 architecture...'});
                await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URI);

                setEngineState({loaded: false, status: 'Loading 68-point facial landmark extractor...'});
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI);

                setEngineState({loaded: false, status: 'Loading ResNet-34 face recognition embedding network...'});
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URI);

                setEngineState({loaded: false, status: 'Parsing CelebA reference vector embeddings...'});
                const response = await fetch('/celeba_embeddings.json');
                const celebaDataset = await response.json();

                const labeledDescriptors = celebaDataset.map(entity => {
                    const vector32 = new Float32Array(entity.descriptor);
                    return new faceapi.LabeledFaceDescriptors(entity.label, [vector32]);
                });

                // Instantiate matcher with rigid Euclidean threshold boundary
                faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
                setEngineState({loaded: true, status: 'Pipeline online. Grant camera permissions.'});

                await bootWebcamMediaStream();
            } catch (error) {
                setEngineState({loaded: false, status: `Pipeline fault: ${error.message}`});
                console.error(error);
            }
        };

        initializeExecutionPipeline();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    const bootWebcamMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {width: 640, height: 480, facingMode: 'user'}
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            setEngineState({loaded: true, status: `Media access denied: ${err.message}`});
        }
    };

    const executeInferenceLoop = () => {
        const infer = async () => {
            if (videoRef.current && canvasRef.current && faceMatcherRef.current) {
                const dimensions = {width: videoRef.current.videoWidth, height: videoRef.current.videoHeight};

                if (dimensions.width > 0 && canvasRef.current.width !== dimensions.width) {
                    faceapi.matchDimensions(canvasRef.current, dimensions);
                }

                const evaluation = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({minConfidence: 0.5}))
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (evaluation) {
                    const alignedDetections = faceapi.resizeResults(evaluation, dimensions);
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

                    faceapi.draw.drawDetections(canvasRef.current, alignedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, alignedDetections);

                    const analyticalMatch = faceMatcherRef.current.findBestMatch(evaluation.descriptor);
                    setMatchResult({label: analyticalMatch.label, distance: analyticalMatch.distance});
                } else {
                    setMatchResult({label: 'Scanning matrix...', distance: null});
                }
            }
            animationFrameId.current = requestAnimationFrame(infer);
        };
        animationFrameId.current = requestAnimationFrame(infer);
    };

    return (
        <div style={{display: 'block', maxWidth: '800px', margin: '40px auto', padding: '0 20px'}}>
            <header style={{marginBottom: '30px'}}>
                <h1 style={{fontSize: '24px', fontWeight: '700', color: '#60a5fa', margin: '0 0 10px 0'}}>
                    Client-Side Edge Facial Matcher Engine
                </h1>
                <p style={{color: '#94a3b8', margin: 0, fontSize: '14px'}}>
                    TensorFlow.js WebGL-accelerated convolutional pipeline executing linear vector scan matching against
                    CelebA matrices.
                </p>
            </header>

            <div style={{
                background: '#1e293b',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                borderLeft: '4px solid #3b82f6'
            }}>
                <strong>Status Node:</strong> {engineState.status}
            </div>

            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '640px',
                height: '480px',
                background: '#020617',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onPlay={executeInferenceLoop}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)'
                    }}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)',
                        zIndex: 2
                    }}
                />
            </div>

            <div style={{marginTop: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px'}}>
                <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '16px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Classification Output
                </h3>
                <div style={{fontSize: '22px', fontWeight: '600'}}>
                    Identity: <span
                    style={{color: matchResult.distance && matchResult.distance < 0.6 ? '#4ade80' : '#f87171'}}>{matchResult.label}</span>
                </div>
                {matchResult.distance !== null && (
                    <div style={{marginTop: '5px', color: '#94a3b8', fontSize: '14px'}}>
                        Euclidean Vector Metric Space Distance: <code style={{
                        color: '#e2e8f0',
                        background: '#334155',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}>{matchResult.distance.toFixed(5)}</code>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
