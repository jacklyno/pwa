const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');
const dbName = 'indexedbd1';
const objectStoreName = 'images';
const apiUrl = 'https://cmja2h0xlg.execute-api.us-west-1.amazonaws.com/beta/mvrs/';

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

// Function to save the image file to IndexedDB with a timestamp key
function saveImageToIndexedDB(db, file) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const timestamp = new Date().getTime(); // Get the current timestamp
    store.put({ timestamp, file });

    transaction.oncomplete = function () {
        console.log('Image saved to IndexedDB with timestamp key:', timestamp);
        db.close();
    };
}

// Function to delete an image from IndexedDB
function deleteImageFromIndexedDB(db, timestamp) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);

    const deleteRequest = store.delete(timestamp);

    deleteRequest.onsuccess = function () {
        console.log(`Image with timestamp ${timestamp} deleted from IndexedDB.`);
        db.close();
    };

    deleteRequest.onerror = function (event) {
        console.error(`Error deleting image: ${event.target.error}`);
    };
}

// Function to upload an image from IndexedDB to the API
function uploadImageToAPI(db, timestamp) {
    const transaction = db.transaction(objectStoreName, 'readonly');
    const store = transaction.objectStore(objectStoreName);

    const getRequest = store.get(timestamp);

    getRequest.onsuccess = function (event) {
        const imageData = event.target.result;

        if (imageData) {
            const filename = `image-${timestamp}.jpg`;

            // Create a FormData object to send the image as a binary file
            const formData = new FormData();
            formData.append('image', imageData.file, filename);

            // Make a PUT request to the API
            fetch(apiUrl + filename, {
                method: 'PUT',
                body: formData,
            })
            .then((response) => {
                if (response.ok) {
                    console.log(`Image ${filename} uploaded successfully.`);
                    
                    // After successful upload, you can delete the image from IndexedDB
                    deleteImageFromIndexedDB(db, timestamp);
                } else {
                    console.error(`Error uploading image ${filename}: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error(`Error uploading image ${filename}: ${error}`);
            });
        }
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
        initIndexedDB((db) => {
            saveImageToIndexedDB(db, file);
            uploadImageToAPI(db, file.lastModified);
        });
    }
});
