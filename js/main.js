// Get references to DOM elements
const video = document.getElementById('video');
const container = document.querySelector('.container');

// Load all necessary FaceAPI models
Promise.all([
 faceapi.nets.tinyFaceDetector.loadFromUri('models'),
 faceapi.nets.faceLandmark68Net.loadFromUri('models'),
 faceapi.nets.faceRecognitionNet.loadFromUri('models'),
 faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo);

// Function to start the video stream
async function startVideo() {
 try {
   // Get access to the user's camera
   const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
   video.srcObject = stream; // Set the video stream as the video source
 } catch (err) {
   console.error('Error accessing camera:', err);
 }
}

// Event listener for when the video starts playing
video.addEventListener('play', () => {
 // Create a canvas element to draw face detection results
 const canvas = faceapi.createCanvasFromMedia(video);
 container.append(canvas); // Append the canvas to the container

 // Get video dimensions and match canvas dimensions
 const { width, height } = video;
 faceapi.matchDimensions(canvas, { width, height });

 // Set up a repeating interval to detect faces
 const intervalId = setInterval(async () => {
   // Detect faces in the video stream
   const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
     .withFaceLandmarks()
     .withFaceExpressions();
   const resizedDetections = faceapi.resizeResults(detections, { width, height });

   // Clear the canvas before drawing new results
   const ctx = canvas.getContext('2d');
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   // Draw face detections, landmarks, and expressions on the canvas
   faceapi.draw.drawDetections(canvas, resizedDetections);
   faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
   faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
 }, 100); // Repeat every 100 milliseconds

 // Clear the interval when video is paused
 video.addEventListener('pause', () => clearInterval(intervalId));
});
