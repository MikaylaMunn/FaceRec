// Get references to DOM elements
const video = document.getElementById("video");
const container = document.querySelector(".container");
let canvas = document.getElementById("canvas");
let div = document.getElementById("canvasResults")

// Load all necessary FaceAPI models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("models"),
  faceapi.nets.faceExpressionNet.loadFromUri("models"),
]).then(startVideo);

// Function to set video and canvas size based on screen dimensions
function setVideoAndCanvasSize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Adjust video and canvas dimensions based on screen size
  const videoAspectRatio = 16 / 9; // Assuming video has a 16:9 aspect ratio
  const canvasAspectRatio = 4 / 3; // Assuming canvas has a 4:3 aspect ratio

  let videoWidth, videoHeight, canvasWidth, canvasHeight;

  if (windowWidth > windowHeight) {
    // Landscape mode
    videoWidth = windowWidth * 0.6; // Use 60% of screen width for video
    videoHeight = videoWidth / videoAspectRatio;
    canvasWidth = windowWidth * 0.4; // Use 40% of screen width for canvas
    canvasHeight = canvasWidth / canvasAspectRatio;
  } else {
    // Portrait mode
    videoHeight = windowHeight * 0.6; // Use 60% of screen height for video
    videoWidth = videoHeight * videoAspectRatio;
    canvasHeight = windowHeight * 0.4; // Use 40% of screen height for canvas
    canvasWidth = canvasHeight * canvasAspectRatio;
  }

  video.width = videoWidth;
  video.height = videoHeight;

  if (canvas) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }
}

// Function to start the video stream
async function startVideo() {
  try {
    // Ensure video and canvas size are set based on screen dimensions
    setVideoAndCanvasSize();

    // Create a canvas element to draw face detection results (if not already created)
    if (!canvas) {
      canvas = faceapi.createCanvasFromMedia(video);
      container.appendChild(canvas); // Append the canvas to the container
    }

    // Create detectionResult element
    const detectionResult = document.createElement("h3");
    detectionResult.id = "detectionResult";
    div.appendChild(detectionResult); // Append detectionResult to the container

    // Get access to the user's camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream; // Set the video stream as the video source
  } catch (err) {
    console.error("Error accessing camera:", err);
  }
}

// Event listener for window resize to update dimensions
window.addEventListener("resize", setVideoAndCanvasSize);

// Event listener for when the video starts playing
video.addEventListener("play", () => {
  // Get video dimensions (updated dynamically)
  const { width, height } = video;
  faceapi.matchDimensions(canvas, { width, height }); // Match canvas size

  // Set up a repeating interval to detect faces
  const intervalId = setInterval(async () => {
    // Detect faces in the video stream
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // Display detection result in the h3 element
    if (detections && detections.length > 0) {
      const {
        expressions,
        expressions: {
          neutral,
          happy,
          sad,
          angry,
          fearful,
          disgusted,
          surprised,
        },
      } = detections[0];
      const expression = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      detectionResult.innerText = `Expression: ${expression} `;
    } else {
      detectionResult.innerText = "No face detected";
    }

    // Clear the canvas before drawing new results
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face detections and landmarks on the canvas with a larger size
    detections.forEach((detection) => {
      const resizedDetection = faceapi.resizeResults(detection, { width: canvas.width, height: canvas.height });
      faceapi.draw.drawDetections(canvas, [resizedDetection]);
      faceapi.draw.drawFaceLandmarks(canvas, [resizedDetection]);
    });
  }, 100); // Repeat every 100 milliseconds

  // Clear the interval when video is paused
  video.addEventListener("pause", () => clearInterval(intervalId));
});
