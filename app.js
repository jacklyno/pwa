const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');

const dbName = 'indexedbd1';
const objectStoreName = 'images';
const apiUrl = 'https://cqiixj66hi.execute-api.us-west-1.amazonaws.com/dev/mvrs/';

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
            db.createObjectStore(objectStoreName, { keyPath: 'timestamp' });
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

    // Create a promise to handle the file reading and the IndexedDB 'put' operation
    const saveImagePromise = new Promise((resolve, reject) => {
        reader.onload = function () {
            const imageBlob = new Blob([new Uint8Array(reader.result)], { type: file.type });
            const request = store.put({ timestamp: formattedTimestamp, file: imageBlob });

            request.onsuccess = function () {
                resolve(formattedTimestamp);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        };

        reader.onerror = function () {
            reject(reader.error);
        };

        reader.readAsArrayBuffer(file);
    });

    saveImagePromise
        .then((formattedTimestamp) => {
            console.log('Image saved to IndexedDB with timestamp key:', formattedTimestamp);
            uploadImageToAPI(db, formattedTimestamp);
        })
        .catch((error) => {
            console.error('Error saving image to IndexedDB:', error);
        });
}


function uploadImageToAPI(db, formattedTimestamp) {
    const transaction = db.transaction(objectStoreName, 'readonly');
    const store = transaction.objectStore(objectStoreName);
    const getRequest = store.get(formattedTimestamp);

    getRequest.onsuccess = function () {
        const fileData = getRequest.result.file;
        const filename = `${formattedTimestamp}.jpg`;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", fileData.type);

        const requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: fileData,
            redirect: 'follow'
        };

        fetch(apiUrl + filename, requestOptions)
            .then(response => {
                if (response.ok) {
                    console.log(`Image uploaded to ${apiUrl}${filename}`);
                    deleteImageFromIndexedDB(db, formattedTimestamp);
                } else {
                    console.error(`Error uploading image ${filename}: ${response.status}`);
                }
            })
            .catch(error => {
                console.error(`Error uploading image ${filename}: ${error}`);
            });
    };
}

function deleteImageFromIndexedDB(db, formattedTimestamp) {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    store.delete(formattedTimestamp);

    transaction.oncomplete = function () {
        console.log(`Image with timestamp ${formattedTimestamp} deleted from IndexedDB`);
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

