const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

// Function to save the image file to IndexedDB with a timestamp key
function saveImageToIndexedDB(db, file) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const timestamp = new Date().getTime(); // Get the current timestamp
    store.put({ timestamp, file });

    transaction.oncomplete = function () {
        console.log('Image saved to IndexedDB with timestamp key:', timestamp);
    };
}

// Event listeners for specific buttons
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

cancelButton.addEventListener('click', () => {
    // Clear the preview
    previewImage.src = '';
    // Remove the image file from memory
    imageInput.value = '';
});

submitButton.addEventListener('click', () => {
    // Add your logic to handle image submission, if needed
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        saveImageToIndexedDB(db, file);
        // Clear the preview
        previewImage.src = '';
        // Remove the image file from memory
        imageInput.value = '';
    }
});

// Event listener for page load
window.addEventListener('load', async () => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(objectStoreName, { keyPath: 'timestamp' });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
    };

    request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
    };
});
