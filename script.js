// Get elements
const startCameraButton = document.getElementById("start-camera");
const uploadImageInput = document.getElementById("upload-image");
const qrVideo = document.getElementById("qr-video");
const qrCanvas = document.getElementById("qr-canvas");
const qrResult = document.getElementById("qr-result");
const outputText = document.getElementById("output-text");
const openLinkButton = document.getElementById("open-link");
const copyLinkButton = document.getElementById("copy-link");
const qrButtons = document.getElementById("qr-buttons");

// QR code scanning related variables
let videoStream = null;
let scanInterval = null;
let currentQRCode = "";

// Function to start the webcam
function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(function (stream) {
        videoStream = stream;
        qrVideo.srcObject = stream;
        qrVideo.play();
        scanQRCodeFromCamera();
      })
      .catch(function (err) {
        alert("Error accessing webcam: " + err);
      });
  } else {
    alert("Camera not supported on your device.");
  }
}

// Function to scan QR Code from webcam
function scanQRCodeFromCamera() {
  scanInterval = setInterval(function () {
    if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
      qrCanvas.width = qrVideo.videoWidth;
      qrCanvas.height = qrVideo.videoHeight;
      qrCanvas
        .getContext("2d")
        .drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);

      const imageData = qrCanvas
        .getContext("2d")
        .getImageData(0, 0, qrCanvas.width, qrCanvas.height);
      const qrCode = jsQR(imageData.data, qrCanvas.width, qrCanvas.height);

      if (qrCode) {
        clearInterval(scanInterval);
        currentQRCode = qrCode.data;
        outputText.textContent = "QR Code Data: " + currentQRCode;
        qrButtons.style.display = "block"; // Show the open and copy buttons
        stopCamera();
      }
    }
  }, 300); // Scan every 300ms
}

// Stop the webcam stream
function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
  }
}

// Function to handle image upload and scan QR code
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          currentQRCode = qrCode.data;
          outputText.textContent = "QR Code Data: " + currentQRCode;
          qrButtons.style.display = "block"; // Show the open and copy buttons
        } else {
          outputText.textContent = "No QR code found in this image.";
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

// Function to open the QR code link
function openLink() {
  if (currentQRCode) {
    window.open(currentQRCode, "_blank");
  }
}

// Function to copy the QR code link to clipboard
function copyLink() {
  if (currentQRCode) {
    navigator.clipboard.writeText(currentQRCode).then(
      function () {
        alert("Link copied to clipboard!");
      },
      function () {
        alert("Failed to copy link.");
      }
    );
  }
}

// Event listeners
startCameraButton.addEventListener("click", startCamera);
uploadImageInput.addEventListener("change", handleImageUpload);
openLinkButton.addEventListener("click", openLink);
copyLinkButton.addEventListener("click", copyLink);
