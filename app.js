const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

const dbName = 'indexeddb1';
const objectStoreName = 'images';

function formatDateToISO(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month}-${day}-${year}T${hours}-${minutes}-${seconds}`;
}

function initIndexedDB(callback) {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(objectStoreName)) {
            const objectStore = db.createObjectStore(objectStoreName, { keyPath: 'timestamp' });
            objectStore.createIndex('timestamp', 'timestamp', { unique: true });
        }
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        callback(db);
    };
}

submitButton.addEventListener('click', () => {
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        initIndexedDB((db) => {
            saveImageToIndexedDB(db, file);
        });
    }
});

function saveImageToIndexedDB(db, file) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const timestamp = new Date().getTime();
    const formattedTimestamp = formatDateToISO(timestamp);

    const reader = new FileReader();
    reader.onload = function () {
        const imageBlob = new Blob([reader.result], { type: file.type }); // Use Blob to store image data

        store.put({ timestamp: formattedTimestamp, image: imageBlob }); // Store imageBlob

        transaction.oncomplete = function () {
            console.log('Image saved to IndexedDB with timestamp key:', formattedTimestamp);
        };

        transaction.onerror = function (event) {
            console.error('Error saving image to IndexedDB:', event.target.error);
        };
    };
    reader.readAsArrayBuffer(file);
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

