import placeholder from "../assets/Portrait_Placeholder.png";
import pose1 from "../assets/poses/pose1.png";
import pose2 from "../assets/poses/pose2.png";
import pose3 from "../assets/poses/pose3.png";
import pose4 from "../assets/poses/pose4.png";
import pose5 from "../assets/poses/pose5.png";
import pose6 from "../assets/poses/pose6.png";
import pose7 from "../assets/poses/pose7.png";
import pose8 from "../assets/poses/pose8.png";
import pose9 from "../assets/poses/pose9.png";

import { useEffect, useRef, useState } from 'react';

// Reference keypoints for each pose
export const poseKeypoints = {};

// Helper function to draw keypoints for debugging
const drawKeypoints = (keypoints, canvas, image, scale = 1) => {
    if (!keypoints || !canvas) {
        console.log('Missing keypoints or canvas:', { hasKeypoints: !!keypoints, hasCanvas: !!canvas });
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // First draw the image
    if (image) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    
    // // Then draw keypoints
    // keypoints.forEach(keypoint => {
    //     // Scale the keypoint coordinates
    //     const x = keypoint.x * scale;
    //     const y = keypoint.y * scale;
        
    //     // Draw point
    //     ctx.beginPath();
    //     ctx.arc(x, y, 5, 0, 2 * Math.PI);
    //     ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    //     ctx.fill();
        
    //     // Draw label
    //     ctx.fillStyle = 'white';
    //     ctx.strokeStyle = 'black';
    //     ctx.font = '12px Arial';
    //     ctx.lineWidth = 2;
    //     ctx.strokeText(keypoint.name, x + 10, y);
    //     ctx.fillText(keypoint.name, x + 10, y);
    // });
};

// Helper function to calculate pose similarity (0-100 score)
export const calculatePoseSimilarity = (referenceKeypoints, userKeypoints) => {
    if (!referenceKeypoints || !userKeypoints || userKeypoints.length === 0) return 0;

    let totalScore = 0;
    let totalPoints = 0;

    // Compare each keypoint
    referenceKeypoints.forEach(refKp => {
        const userKp = userKeypoints.find(kp => kp.label === refKp.name);
        if (userKp && refKp.confidence > 0.1) {
            // Calculate Euclidean distance between points
            const distance = Math.sqrt(
                Math.pow(refKp.x - userKp.x, 2) + 
                Math.pow(refKp.y - userKp.y, 2)
            );
         
            const MAX_DISTANCE = 200;
            const PERFECT_DISTANCE = 10;
            
            let pointScore;
            if (distance <= PERFECT_DISTANCE) {
                pointScore = 100;
            } else if (distance >= MAX_DISTANCE) {
                pointScore = 0;
            } else {
                // Linear decrease from 100 to 0 between PERFECT_DISTANCE and MAX_DISTANCE
                pointScore = Math.round(
                    100 * (1 - (distance - PERFECT_DISTANCE) / (MAX_DISTANCE - PERFECT_DISTANCE))
                );
            }
            console.log(userKp.label, distance, pointScore);
            
            totalScore += pointScore;
            totalPoints++;
        }
    });

    return totalPoints > 0 ? Math.round(totalScore / totalPoints) : 0;
};

export default function PoseSelector({index, showPose, countdown, started}) {
    const images = [pose1, pose2, pose3, pose4, pose5, pose6, pose7, pose8, pose9];
    const debugCanvasRef = useRef(null);
    const [imageSize, setImageSize] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const containerRef = useRef(null);
    const poseNetRef = useRef(null);
    const offscreenCanvasRef = useRef(null);

    // Effect to handle image loading and canvas setup
    useEffect(() => {
        if (showPose && images[index]) {
            const img = new Image();
            img.src = images[index];
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
                setCurrentImage(img);
            };
        }
    }, [index, showPose]);

    // Effect to handle canvas drawing and scaling
    useEffect(() => {
        if (debugCanvasRef.current && imageSize && currentImage && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const scale = containerWidth / imageSize.width;
            const scaledHeight = imageSize.height * scale;
            
            // Set canvas size to the scaled dimensions
            debugCanvasRef.current.width = containerWidth;
            debugCanvasRef.current.height = scaledHeight;
            
            // Draw image and keypoints if available
            if (poseKeypoints[index]) {
                drawKeypoints(poseKeypoints[index], debugCanvasRef.current, currentImage, scale);
            } else {
                // If no keypoints, just draw the image
                const ctx = debugCanvasRef.current.getContext('2d');
                ctx.drawImage(currentImage, 0, 0, containerWidth, scaledHeight);
            }
        }
    }, [imageSize, index, poseKeypoints, currentImage]);

    // Extract keypoints from reference poses on component mount
    useEffect(() => {
        const loadPoseKeypoints = async () => {
            console.log('Starting pose keypoint detection');
            
            // Create a single offscreen canvas for processing
            if (!offscreenCanvasRef.current) {
                offscreenCanvasRef.current = document.createElement('canvas');
            }
            const canvas = offscreenCanvasRef.current;
            const ctx = canvas.getContext('2d');

            // Create a single model instance
            if (!poseNetRef.current && window.ml5) {
                poseNetRef.current = await new Promise((resolve) => {
                    const poseNet = window.ml5.bodyPose(canvas, () => {
                        console.log("Model loaded");
                        resolve(poseNet);
                    });
                });
            }

            if (!poseNetRef.current) {
                console.error("Failed to load ml5.js or create model");
                return;
            }

            // Process each image with the same model instance
            for (let i = 0; i < images.length; i++) {
                const img = new Image();
                img.src = images[i];
                await new Promise((resolve) => {
                    img.onload = async () => {
                        console.log(`Processing image ${i}`);
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        try {
                            const results = await new Promise((resolveDetect) => {
                                poseNetRef.current.detect(canvas, (results) => {
                                    resolveDetect(results);
                                });
                            });
                            
                            console.log(`Got detection results for pose ${i}:`, results);
                            if (results && results.length > 0) {
                                const pose = results[0];
                                poseKeypoints[i] = pose.keypoints.map(kp => ({
                                    name: kp.name,
                                    x: kp.x,
                                    y: kp.y,
                                    confidence: kp.confidence
                                }));
                            }
                        } catch (error) {
                            console.error(`Error processing pose ${i}:`, error);
                        }
                        resolve();
                    };
                });
            }

            // Clean up
            if (poseNetRef.current) {
                poseNetRef.current.detectStop();
            }
        };

        loadPoseKeypoints();

        // Cleanup function
        return () => {
            if (poseNetRef.current) {
                poseNetRef.current.detectStop();
            }
        };
    }, []);

    if (!started) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <img src={placeholder} className='w-full' />
            </div>
        )
    }

    if (!showPose) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {countdown > 0 && (
                    <div className="text-6xl font-bold text-gray-400">{countdown}</div>
                )}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <canvas 
                ref={debugCanvasRef}
                className="w-full"
            />
        </div>
    )
}