// 3D Pose Detection with Interpolation
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/7-bodypose/pose-detection

let video;
let bodyPose;
let connections;
let poses = [];
let lerpPoints;
let angle = 0;

function preload() {
  // Initialize BlazePose model for 3D pose estimation
  bodyPose = ml5.bodyPose("BlazePose");
}

function gotPoses(results) {
  poses = results;
}

function setup() {
  createCanvas(640, 360, WEBGL);
  video = createCapture(VIDEO);
  video.loop();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
}

function draw() {
  scale(height / 2);
  orbitControl();
  background(0);

  if (poses.length > 0) {
    let pose = poses[0];

    // Initialize interpolation points on first detection
    if (!lerpPoints) {
      lerpPoints = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        lerpPoints[i] = createVector();
      }
    }

    // Smoothly interpolate keypoints
    for (let i = 0; i < pose.keypoints.length; i++) {
      let keypoint = pose.keypoints3D[i];
      let lerpPoint = lerpPoints[i];
      let amt = 0.1;
      lerpPoint.x = lerp(lerpPoint.x, keypoint.x, amt);
      lerpPoint.y = lerp(lerpPoint.y, keypoint.y, amt);
      lerpPoint.z = lerp(lerpPoint.z, keypoint.z, amt);

      // Draw interpolated keypoints
      stroke(255, 0, 255);
      strokeWeight(16);
      push();
      translate(lerpPoint.x, lerpPoint.y, lerpPoint.z);
      point(0, 0);
      pop();
    }

    // Draw interpolated skeleton connections
    for (let i = 0; i < connections.length; i++) {
      let connection = connections[i];
      let a = connection[0];
      let b = connection[1];
      let keyPointA = pose.keypoints3D[a];
      let keyPointB = pose.keypoints3D[b];
      let lerpPointA = lerpPoints[a];
      let lerpPointB = lerpPoints[b];

      let confA = keyPointA.confidence;
      let confB = keyPointB.confidence;

      stroke(0, 255, 255);
      strokeWeight(4);
      beginShape();
      vertex(lerpPointA.x, lerpPointA.y, lerpPointA.z);
      vertex(lerpPointB.x, lerpPointB.y, lerpPointB.z);
      endShape();
    }
  }

  // Draw ground plane
  stroke(255);
  rectMode(CENTER);
  strokeWeight(1);
  fill(255, 100);
  translate(0, 1);
  rotateX(PI / 2);
  square(0, 0, 2);
}

function mousePressed() {
  console.log(poses);
}
