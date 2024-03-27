// Get the video element by its ID
const video = document.getElementById('video')
const container = document.querySelector('.container');

// Load the necessary faceapi models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo) // Once the models are loaded, start the video

// Function to start the video stream
function startVideo() {
    // Use getUserMedia to access the user's camera
    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream, // If successful, set the video stream as the source
        err => console.error(err) // If there's an error, log it to the console
    )
}

// Event listener for when the video starts playing
video.addEventListener('play', () => {
    // Create a canvas element to draw the face detection results
    const canvas = faceapi.createCanvasFromMedia(video)
    container.append(canvas) // Append the canvas to the body
    const displaySize = {width: video.width, height: video.height} // Set the display size to match the video's dimensions
    faceapi.matchDimensions(canvas, displaySize) // Match the canvas dimensions to the display size
    setInterval(async() => {
        // Detect faces in the video stream using the TinyFaceDetector
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections,displaySize) // Resize the detection results to match the display size
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height) // Clear the canvas before drawing new results
        faceapi.draw.drawDetections(canvas,resizedDetections) // Draw the face detections on the canvas
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections) // Draw the face landmarks (e.g., eyes, nose, mouth) on the canvas
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // Draw the face expressions (e.g., happy, sad) on the canvas
    }, 100) // Repeat the detection process every 100 milliseconds
})
