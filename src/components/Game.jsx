import { useState, useRef, useEffect } from "react";
import p5 from 'p5';
import PoseSelector, { poseKeypoints, calculatePoseSimilarity } from "./PoseSelector";

const GameState = {
    IDLE: 'idle',
    COUNTDOWN: 'countdown',
    SHOWING_POSE: 'showing_pose',
    SCORING: 'scoring'
};

const TIMEOUT_MULTIPLIER = {
    [GameState.COUNTDOWN]: 1,
    [GameState.SHOWING_POSE]: 4,
    [GameState.SCORING]: 1,
};

export default function Game({ colors}) {
    const [started, setStarted] = useState(false);
    const gameCanvasRef = useRef(null);
    const [points, setPoints] = useState(0);
    const [keypoints, setKeypoints] = useState([]);
    const [countdown, setCountdown] = useState(3);
    const [showPose, setShowPose] = useState(false);
    const [round, setRound] = useState(1);
    const [maxRounds, setMaxRounds] = useState(2);
    const [gameState, setGameState] = useState(GameState.IDLE);
    const [gameOver, setGameOver] = useState(false);
    const [index, setIndex] = useState(0);
    const [currentPoseScore, setCurrentPoseScore] = useState(0);
    const SPEED = 750;

    const start = () => {
        setStarted(true);
        setPoints(0);
        setRound(1);
        setGameOver(false);
        setShowPose(false);
        setCountdown(3);
        setGameState(GameState.COUNTDOWN);
    };

    useEffect(() => {
        if (!started) return;
        console.log(gameState);

        const timer = setTimeout(() => {
            switch (gameState) {
                case GameState.COUNTDOWN:
                    if (countdown > 1) {
                        setCountdown(c => c - 1);
                    } else {
                        setCountdown(0);
                        setShowPose(true);
                        setGameState(GameState.SHOWING_POSE);
                    }
                    break;

                case GameState.SHOWING_POSE:
                    setShowPose(false);
                    setGameState(GameState.SCORING);
                    break;

                case GameState.SCORING:
                    // Calculate score based on pose similarity
                    const poseScore = calculatePoseSimilarity(poseKeypoints[index], keypoints);
                    setCurrentPoseScore(poseScore);
                    setPoints(prev => prev + poseScore);
                    
                    if (round < maxRounds) {
                        setRound(prev => prev + 1);
                        setCountdown(3);
                        setGameState(GameState.COUNTDOWN);
                    } else {
                        setGameOver(true);
                        setStarted(false);
                        setGameState(GameState.IDLE);
                    }
                    break;
            }
        }, TIMEOUT_MULTIPLIER[gameState] * SPEED || SPEED);

        return () => clearTimeout(timer);
    }, [gameState, started, countdown, round, maxRounds]);

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


    return (
        <div className="bg-gray-200 rounded-3xl p-4 m-10 w-[1200px]">
            <p className="p-2">
                <span className="font-semibold">Score:</span> {points}
                {gameState === GameState.SCORING && (
                    <span className="ml-2 text-gray-500">
                        (Last pose similarity: {currentPoseScore}%)
                    </span>
                )}
            </p>
            <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-2xl border-2 overflow-hidden aspect-[4/3]'>
                    <PoseSelector index={index} showPose={showPose} countdown={countdown} started={started} />
                </div>
                <div className='w-full rounded-2xl border-2 overflow-hidden aspect-[4/3]' ref={gameCanvasRef}>
                </div>
            </div>
            <div className="w-full flex flex-col items-center pt-4">
                {!started && !gameOver &&
                    <div onClick={start} className={`flex items-center justify-center overflow-hidden h-10 w-[50%] cursor-pointer rounded-2xl ${colors[index % colors.length]}`}>
                        <a className='text-center text-sm text-white font-bold'>Start</a>
                    </div>
                }
                {!started && gameOver &&
                    <div className="flex flex-col items-center">
                        <div className="text-center font-bold text-3xl py-4">
                            Game Over! Final Score: {points}
                        </div>
                        <div onClick={start} className={`flex items-center justify-center overflow-hidden h-10 w-[200px] cursor-pointer rounded-2xl ${colors[index % colors.length]}`}>
                            <a className='text-center text-sm text-white font-bold'>Play Again</a>
                        </div>
                    </div>
                }
                {started && 
                    <div className="text-center font-bold text-3xl py-4">
                        {countdown > 0 ? countdown : showPose ? "Replicate the pose!" : "Scoring..."}
                    </div>
                }
            </div>


        </div>
    )
}