# Move It! 🕺

A computer vision-based pose estimation game that challenges users to replicate predefined poses with real-time feedback and scoring.

## Overview

Move It! leverages machine learning to create an interactive experience that combines computer vision and human-computer interaction. The application uses ml5.js for real-time pose detection and tracking, providing users with immediate feedback on their pose accuracy.

## Technical Implementation

- **AI Framework**: Built with ml5.js for real-time pose estimation
- **Frontend**: React.js with modern component architecture
- **Graphics**: p5.js for canvas manipulation and real-time rendering
- **Performance**: Optimized frame processing and pose detection algorithms

## How It Works

1. **Initialization**
   - System performs camera setup and ML model initialization
   - User interface displays in split-screen format: reference pose and user feed
   - Real-time pose tracking begins upon user confirmation

2. **Gameplay Loop**
   - Sequential display of 9 predefined reference poses
   - 3-second preparation countdown between poses
   - Real-time skeletal tracking overlay on user feed
   - Continuous pose similarity calculation and scoring

3. **Scoring System**
   - Algorithm compares 17 key body points between reference and user poses
   - Similarity metrics calculated using Euclidean distance measurements
   - Score aggregation across multiple data points for comprehensive evaluation
   - Real-time performance feedback with percentage-based accuracy

## User Requirements

- Modern web browser with WebGL support
- Webcam access
- Adequate lighting conditions
- Sufficient space for full-body movement
- Recommended: Solid-colored background for optimal tracking

## Performance Optimization

For optimal pose detection:
- Position camera to capture upper body
- Ensure consistent lighting without strong backlighting
- Maintain clear contrast between user and background

## Features

- Real-time pose estimation and tracking
- Dynamic scoring system
- Performance analytics
- Leaderboard integration
- Mirror-adjusted display
- Audio feedback system

## Acknowledgments

This project was developed as part of the Interactive Media course CIM343 Front End Fundamentals, implementing modern web technologies and machine learning concepts in an interactive application.