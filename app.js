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

// Function to convert the selected image to a base64 string
function imageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
        callback(event.target.result);
    };
    reader.readAsDataURL(file);
}

// Function to save the base64 string to IndexedDB with a timestamp key
function saveToIndexedDBWithTimestamp(value) {
    const request = indexedDB.open('indexedbd1', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction('images', 'readwrite'); // Object store name is 'images'
        const store = transaction.objectStore('images');
        const timestamp = new Date().getTime(); // Get the current timestamp
        store.put(value, timestamp); // Use the timestamp as the key

        transaction.oncomplete = function () {
            console.log('Image saved to IndexedDB with timestamp key:', timestamp);
            db.close();
        };
    };
}

submitButton.addEventListener('click', () => {
    // Add your logic to handle image submission, if needed
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        imageToBase64(file, (base64String) => {
            saveToIndexedDBWithTimestamp(base64String);
        });
    }
});
