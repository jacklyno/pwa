const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

takePictureButton.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const imageURL = URL.createObjectURL(file);
        previewImage.src = imageURL;
    }
});

// Add event listeners for the "Cancel" and "Submit" buttons
cancelButton.addEventListener('click', () => {
    // Clear the preview
    previewImage.src = '';
    // Remove the image file from memory
    imageInput.value = '';
});

submitButton.addEventListener('click', () => {
    // Add your logic to handle image submission, if needed
    // This can include uploading the image to a server or performing other actions.
});
