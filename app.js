const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

const dbName = 'indexedbd1';
const objectStoreName = 'images';

// Function to convert the selected image to a base64 string
function imageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
        callback(event.target.result);
    };
    reader.readAsDataURL(file);
}

// Function to initialize IndexedDB and create the object store
function initIndexedDB(callback) {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(objectStoreName)) {
            db.createObjectStore(objectStoreName, { keyPath: 'timestamp' });
        }
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        callback(db);
    };
}

// Function to save the base64 string to IndexedDB with a timestamp key
function saveToIndexedDBWithTimestamp(db, value) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const timestamp = new Date().getTime(); // Get the current timestamp
    store.put({ timestamp, data: value });

    transaction.oncomplete = function () {
        console.log('Image saved to IndexedDB with timestamp key:', timestamp);
        db.close();
    };
}

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
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        imageToBase64(file, (base64String) => {
            initIndexedDB((db) => {
                saveToIndexedDBWithTimestamp(db, base64String);
            });
        });
    }
});

