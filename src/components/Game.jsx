import placeholder from "../assets/Portrait_Placeholder.png";
import { useState, useRef, useEffect } from "react";
import p5 from 'p5';

export default function Game({ colors, index }) {
    const [started, setStarted] = useState(false);
    const gameCanvasRef = useRef(null);
    const [keypoints, setKeypoints] = useState([]);
    const [points, setPoints] = useState(0);

    useEffect(() => {
        const sketch = (p) => {
            let bodyPose;
            let video;
            let poses = [];
            let connections;


            p.setup = () => {
                const container = gameCanvasRef.current;
                const canvasWidth = container.offsetWidth;
                const canvasHeight = container.offsetHeight;
                p.createCanvas(canvasWidth, canvasHeight).parent(container);
                video = p.createCapture(p.VIDEO);
                video.hide();


                function gotPoses(results) {
                    poses = results;
                    const keypointCoords = [];
                    for (let i = 0; i < poses.length; i++) {
                        let pose = poses[i];
                        for (let j = 0; j < pose.keypoints.length; j++) {
                            let keypoint = pose.keypoints[j];
                            if (keypoint.confidence > 0.1) {
                                keypointCoords.push({ label: keypoint.name, x: keypoint.x, y: keypoint.y });
                            }
                        }
                    }
                    setKeypoints(keypointCoords);
                }

                if (window.ml5) {
                    bodyPose = window.ml5.bodyPose(video, () => {
                        console.log("Model loaded");
                        bodyPose.detectStart(video, gotPoses);
                        connections = bodyPose.getSkeleton();
                    });
                } else {
                    console.error("ml5.js is not loaded. Ensure the script tag is in index.html.");
                }
            };

            p.draw = () => {
                const videoWidthIntrinsic = video.elt.videoWidth;
                const videoHeightIntrinsic = video.elt.videoHeight;

                if (!videoWidthIntrinsic || !videoHeightIntrinsic) return;

                const canvasWidth = p.width;
                const canvasHeight = p.height;

                const canvasAspect = canvasWidth / canvasHeight;
                const videoAspect = videoWidthIntrinsic / videoHeightIntrinsic;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (videoAspect > canvasAspect) {
                    drawHeight = canvasHeight;
                    drawWidth = videoAspect * canvasHeight;
                    offsetX = -(drawWidth - canvasWidth) / 2;
                    offsetY = 0;
                } else {
                    drawWidth = canvasWidth;
                    drawHeight = canvasWidth / videoAspect;
                    offsetX = 0;
                    offsetY = -(drawHeight - canvasHeight) / 2;
                }
                p.image(video, offsetX, offsetY, drawWidth, drawHeight);

                for (let i = 0; i < poses.length; i++) {
                    let pose = poses[i];
                    for (let j = 0; j < connections.length; j++) {
                        let keypoint = pose.keypoints[j];
                        let pointAIndex = connections[j][0];
                        let pointBIndex = connections[j][1];
                        let pointA = pose.keypoints[pointAIndex];
                        let pointB = pose.keypoints[pointBIndex];

                        let ax = offsetX + (pointA.x / videoWidthIntrinsic) * drawWidth;
                        let ay = offsetY + (pointA.y / videoHeightIntrinsic) * drawHeight;
                        let bx = offsetX + (pointB.x / videoWidthIntrinsic) * drawWidth;
                        let by = offsetY + (pointB.y / videoHeightIntrinsic) * drawHeight;
                        let x = offsetX + (keypoint.x / videoWidthIntrinsic) * drawWidth;
                        let y = offsetY + (keypoint.y / videoHeightIntrinsic) * drawHeight;

                        if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
                            p.stroke(255, 0, 0);
                            p.strokeWeight(2);
                            p.line(ax, ay, bx, by);
                        }
                        if (keypoint.confidence > 0.1) {
                            p.fill(0, 255, 0);
                            p.noStroke();
                            p.circle(x, y, 10);
                        }
                    }
                }
            };
        };

        const p5Instance = new p5(sketch);

        return () => {
            p5Instance.remove();
        };
    }, []);

    const start = () => {
        setStarted(true);
    }

    return (
        <div className="bg-gray-200 rounded-3xl p-4">
            <p className="p-2"><span className="font-semibold">Score:</span> {points}</p>
            <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-2xl border-2 overflow-hidden'>
                    <img src={placeholder} className='w-full' />
                </div>
                <div className='w-full h-full rounded-2xl border-2 overflow-hidden' ref={gameCanvasRef}>
                </div>
            </div>
            <div className="w-full flex flex-col items-center pt-4">
                <div onClick={start} className={`flex items-center justify-center overflow-hidden h-10 w-[50%] cursor-pointer rounded-2xl ${colors[index % colors.length]}`}>
                    <a className='text-center text-sm text-white font-bold'>Start</a>
                </div>
            </div>
        </div>
    )
}