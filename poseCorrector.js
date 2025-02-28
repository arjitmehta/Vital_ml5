let video;
let bodyPose;
let visiblePoints;
let angleRange;
let poses = [];
let connections = [];
let yogaPose;

function preload() {
  let options = {
    runtime: "mediapipe",
    modelType: "full",
    flipHorizontal: false,
    enableSegmentation: true,
    smoothSegmentation: true,
    enableSmoothing: true,
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
  };
  bodyPose = ml5.bodyPose("BlazePose", options);
}

 function setup() {
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  yogaPose =  urlParams.get("yoga")?.trim();
  visiblePoints = yogaAasana[yogaPose]["require_angles"];
  angleRange = yogaAasana[yogaPose]["angle_range"];
  

  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();

  // Start the pose detection
  bodyPose.detectStart(video, gotPoses);

  // Get skeleton info
  connections = bodyPose.getSkeleton();
  console.log("connections", connections);
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(220);
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();
  drawSkeletonAndPoints();
}

function drawSkeletonAndPoints() {
  // The video feed might be, for example, 640x480,
  // but we're stretching it to windowWidth x windowHeight.
  let scaleX = width / video.width;
  let scaleY = height / video.height;

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

   
    for (visiblePoint of visiblePoints) {
      let [iA, iB, iC] = visiblePoint;
      let kpA = pose.keypoints[iA];
      let kpB = pose.keypoints[iB];
      let kpC = pose.keypoints[iC];
      const angle = findAngle(kpA, kpB, kpC);
      if (
        kpA.confidence > 0.15 &&
        kpB.confidence > 0.15 &&
        kpC.confidence > 0.15
      ) {
        if (angle > 70 && angle < 95) {
          stroke(0, 255, 255);
        } else {
          stroke(255, 0, 0);
        }
        strokeWeight(3);
        let xA = width - kpA.x * scaleX;
        let yA = kpA.y * scaleY;
        let xB = width - kpB.x * scaleX;
        let yB = kpB.y * scaleY;
        let xC = width - kpC.x * scaleX;
        let yC = kpC.y * scaleY;

        line(xA, yA, xB, yB);
        line(xB, yB, xC, yC);
      }

      // Draw keypoints
      for (point of visiblePoint) {
        let kp = pose.keypoints[point];
        if (kp.confidence > 0.2) {
          if (angle > 70 && angle < 95) {
            fill(0, 255, 0);
          } else {
            fill(255, 0, 0);
          }
          noStroke();
          let xMirrored = width - kp.x * scaleX;
          let yMirrored = kp.y * scaleY;
          if (point === visiblePoint[1]) {
            textSize(24);
            text(angle, xMirrored, yMirrored - 10);
          }

          circle(xMirrored, yMirrored, 8);
        }
      }
    }
  }
}

function findAngle(startPoint, middlePoint, endPoint) {
  let startHorizontal = startPoint.x,
    startVertical = startPoint.y;
  let middleHorizontal = middlePoint.x,
    middleVertical = middlePoint.y;
  let endHorizontal = endPoint.x,
    endVertical = endPoint.y;

  let angle =
    (Math.atan2(
      endVertical - middleVertical,
      endHorizontal - middleHorizontal
    ) -
      Math.atan2(
        startVertical - middleVertical,
        startHorizontal - middleHorizontal
      )) *
    (180 / Math.PI);

  if (angle < 0) {
    angle += 360;
  }
  if (angle > 180) {
    angle = 360 - angle;
  }
  return Math.floor(angle);
}

function mousePressed() {
  console.log(poses);
}
