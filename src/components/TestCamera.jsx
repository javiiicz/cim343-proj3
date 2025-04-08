import p5 from 'p5';
import { useRef, useEffect, useState } from 'react';


const TestCamera = ({ toggle }) => {
    const canvasRef = useRef(null);
    const [keypoints, setKeypoints] = useState([]); 

    useEffect(() => {
        const sketch = (p) => {
            let bodyPose;
            let video;
            let poses = [];
            let connections;
            

            p.setup = () => {
                p.createCanvas(640, 480).parent(canvasRef.current);
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


    return (
        <div className='bg-black/50 w-full h-screen absolute flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl drop-shadow-md p-6 flex flex-col gap-2 items-center border-2 border-solid border-red-500'>
                <h3 className='font-bold w-full underline decoration-rose-400'>Test Your Camera</h3>

                <div className='grid grid-cols-2 w-full h-full'>
                    <div ref={canvasRef}></div>
                    <div className='p-3'>
                        <h4 className='font-bold'>Points</h4>
                        {keypoints.length > 0 ? (
                            <ul>
                                {keypoints.map((point, index) => (
                                    <li key={index}>
                                        {point.label}: x: {point.x.toFixed(2)}, y: {point.y.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No keypoints detected yet.</p>
                        )}
                    </div>
                </div>

                <div onClick={toggle} className={`flex items-center justify-center overflow-hidden h-10 w-[50%] cursor-pointer rounded-2xl bg-gray-700 hover:bg-gray-500`}>
                    <a className='text-center text-sm text-white font-bold'>Done!</a>
                </div>
            </div>
        </div>
    );
};

export default TestCamera;
