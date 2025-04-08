import placeholder from "../assets/Portrait_Placeholder.png";
import { useState, useRef, useEffect } from "react";
import p5 from 'p5';

export default function Game({ colors, index }) {
    const [started, setStarted] = useState(false);
    const gameCanvasRef = useRef(null);
    const [keypoints, setKeypoints] = useState([]); 
    
        useEffect(() => {
            const sketch = (p) => {
                let bodyPose;
                let video;
                let poses = [];
                let connections;
                
    
                p.setup = () => {
                    p.createCanvas(640, 480).parent(gameCanvasRef.current);
                    video = p.createCapture(p.VIDEO);
                    video.size(640, 480);
                    video.hide();
    
                    function gotPoses(results) {
                        // Store the model's results in a global variable
                        poses = results;
    
                        // Extract the coordinates of keypoints and update the state
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
    
                    // Ensure ml5 is available before using it
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
                    console.log("frame")
                    p.image(video, 0, 0, p.width, p.height);
    
                    for (let i = 0; i < poses.length; i++) {
                        let pose = poses[i];
                        for (let j = 0; j < connections.length; j++) {
                            let keypoint = pose.keypoints[j];
                            let pointAIndex = connections[j][0];
                            let pointBIndex = connections[j][1];
                            let pointA = pose.keypoints[pointAIndex];
                            let pointB = pose.keypoints[pointBIndex];
                            if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
                                p.stroke(255, 0, 0);
                                p.strokeWeight(2);
                                p.line(pointA.x, pointA.y, pointB.x, pointB.y);
                            }
                            if (keypoint.confidence > 0.1) {
                                p.fill(0, 255, 0);
                                p.noStroke();
                                p.circle(keypoint.x, keypoint.y, 10);
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
            <p className="p-2"><span className="font-semibold">Score:</span> 0</p>
            <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-2xl border-2 overflow-hidden'>
                    <img src={placeholder} className='w-full' />
                </div>
                <div className=' rounded-2xl border-2 overflow-hidden'>
                    <div className="object-cover" ref={gameCanvasRef}></div>
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