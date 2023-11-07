const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

const dbName = 'indexedbd1';
const objectStoreName = 'images';
const apiUrl = 'https://cmja2h0xlg.execute-api.us-west-1.amazonaws.com/beta/mvrs/';

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

    deleteRequest.onsuccess = () => {
        console.log('Image deleted from IndexedDB:', timestamp);
    };

    deleteRequest.onerror = (event) => {
        console.error('Error deleting image from IndexedDB:', event.target.error);
    };
}

// Function to upload images to the specified API endpoint
function uploadImagesFromIndexedDB() {
    initIndexedDB((db) => {
        const transaction = db.transaction(objectStoreName, 'readonly');
        const store = transaction.objectStore(objectStoreName);
        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const timestamp = cursor.key;
                const imageFile = cursor.value.file;

                // Create a FormData object to send the image file
                const formData = new FormData();
                formData.append('file', imageFile, `image-${timestamp}.jpg`);

                // Send a PUT request to the API endpoint with the image in the body
                fetch(apiUrl + `image-${timestamp}.jpg`, {
                    method: 'PUT',
                    body: formData,
                })
                    .then((response) => {
                        if (response.ok) {
                            // If the upload is successful, delete the image from IndexedDB
                            deleteImageFromIndexedDB(db, timestamp);
                        } else {
                            console.error(`Error uploading image ${timestamp}: ${response.status}`);
                        }
                    })
                    .catch((error) => {
                        console.error(`Error uploading image ${timestamp}: ${error}`);
                    });

                cursor.continue();
            } else {
                db.close();
            }
        };
    });
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
            // Upload the image to the API
            uploadImagesFromIndexedDB();
        });
    }
});
