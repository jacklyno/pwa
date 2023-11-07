const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

const dbName = 'indexedbd1';
const objectStoreName = 'images';
const apiUrl = 'https://cmja2h0xlg.execute-api.us-west-1.amazonaws.com/beta/mvrs/';

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

function saveImageToIndexedDB(db, file) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const timestamp = new Date().getTime();
    store.put({ timestamp, file });

    transaction.oncomplete = function () {
        console.log('Image saved to IndexedDB with timestamp key:', timestamp);
        db.close();
    };
}

function uploadImageToAPI(db, timestamp, file) {
    const filename = `image-${timestamp}.jpg`;
    const requestOptions = {
        method: 'PUT',
        body: file,
    };

    fetch(apiUrl + filename, requestOptions)
        .then((response) => {
            if (response.ok) {
                console.log(`Image uploaded to ${apiUrl}${filename}`);
                // If the upload is successful, you can remove the image from IndexedDB
                deleteImageFromIndexedDB(db, timestamp);
            } else {
                console.error(`Error uploading image ${filename}: ${response.status}`);
            }
        })
        .catch((error) => {
            console.error(`Error uploading image ${filename}: ${error}`);
        });
}

function deleteImageFromIndexedDB(db, timestamp) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    store.delete(timestamp);

    transaction.oncomplete = function () {
        console.log(`Image with timestamp ${timestamp} deleted from IndexedDB`);
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

cancelButton.addEventListener('click', () => {
    previewImage.src = '';
    imageInput.value = '';
});

submitButton.addEventListener('click', () => {
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        initIndexedDB((db) => {
            saveImageToIndexedDB(db, file);
            uploadImageToAPI(db, file.lastModified, file);
        });
    }
});
