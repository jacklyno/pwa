const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');

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
