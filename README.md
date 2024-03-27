## Face Detection and Expression Recognition Using JavaScript and face-api.js

### Overview
This project demonstrates real-time face detection and expression recognition using the `face-api.js` library in a web browser. The application captures video from the user's camera and uses the `getUserMedia` API to access the video stream. 

### Technologies Used
- JavaScript
- HTML
- CSS
- `face-api.js`

### How It Works
1. **Loading Models:** The application first loads the necessary models for face detection, face landmarks, face recognition, and face expression recognition using `Promise.all` to ensure all models are loaded before starting the video stream.

2. **Starting the Video Stream:** Once the models are loaded, the `startVideo` function is called. This function uses `navigator.getUserMedia` to access the user's camera and sets the video stream as the source for the video element.

3. **Face Detection and Expression Recognition:** When the video starts playing, the application creates a canvas element to draw the face detection and expression recognition results. It then sets the canvas dimensions to match the video's display size.

4. **Drawing Results:** The application uses `setInterval` to repeatedly detect faces in the video stream. It uses the `detectAllFaces` method with the `TinyFaceDetectorOptions` to detect faces, landmarks, and expressions. It then resizes the detection results to match the canvas's display size and draws the face detections, landmarks, and expressions on the canvas.

### Running the Application
To run this application, you need a web browser that supports the `getUserMedia` API (such as Google Chrome or Firefox). Simply open the `index.html` file in your browser, and you should see the real-time face detection and expression recognition in action.

### Note
- This project is for demonstration purposes and may require additional setup (such as serving the files from a web server) for full functionality in some environments.
- Make sure to include the `face-api.js` library in your project for the code to work correctly.