let video;
let bodyPose;
let poses = [];
let connections = [];

function preload() {
  // No automatic flipping by ml5
  let options = {
    runtime: "mediapipe",
    modelType: "full",
    flipHorizontal: false, // We will do manual flipping
    enableSegmentation: true,
    smoothSegmentation: true,
    enableSmoothing: true,
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
  };
  bodyPose = ml5.bodyPose("BlazePose", options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.hide();

  // Start the pose detection
  bodyPose.detectStart(video, gotPoses);

  // Get skeleton info
  connections = bodyPose.getSkeleton();
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(220);

  // 1) Mirror the video on the canvas
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // 2) Draw the skeleton mirrored as well
  drawSkeletonAndPoints();
}

function drawSkeletonAndPoints() {
  // The video feed might be, for example, 640x480, 
  // but we're stretching it to windowWidth x windowHeight.
  let scaleX = width / video.width;
  let scaleY = height / video.height;

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    // Draw skeleton
    for (let c = 0; c < connections.length; c++) {
      let [iA, iB] = connections[c];
      let kpA = pose.keypoints[iA];
      let kpB = pose.keypoints[iB];
      
      if (kpA.confidence > 0.1 && kpB.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        // Mirror the x-coordinates by doing: mirroredX = canvasWidth - (originalX * scaleX)
        let xA = width - (kpA.x * scaleX);
        let yA = kpA.y * scaleY;
        let xB = width - (kpB.x * scaleX);
        let yB = kpB.y * scaleY;
        
        line(xA, yA, xB, yB);
      }
    }

    // Draw keypoints
    for (let j = 0; j < pose.keypoints.length; j++) {
      let kp = pose.keypoints[j];
      if (kp.confidence > 0.1) {
        fill(0, 0, 255);
        noStroke();
        let xMirrored = width - (kp.x * scaleX);
        let yMirrored = kp.y * scaleY;
        circle(xMirrored, yMirrored, 8);
      }
    }
  }
}

function mousePressed() {
  console.log(poses);
}
