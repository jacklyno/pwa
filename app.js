const takePictureButton = document.getElementById('takePicture');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const cancelButton = document.getElementById('cancelButton');
const submitButton = document.getElementById('submitButton');
const storeName = 'images';
const dbName = 'indexeddb1'; // Define the dbName variable

// ...

submitButton.addEventListener('click', () => {
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        initIndexedDB((db) => {
            saveImageToIndexedDB(db, file);
        });
    }
});

function saveImageToIndexedDB(db, file) {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const timestamp = new Date().getTime();
    const formattedTimestamp = formatDateToISO(timestamp);

    const reader = new FileReader();
    reader.onload = function () {
        const arrayBuffer = reader.result;

        transaction.oncomplete = function () {
            const request = store.add({ timestamp: formattedTimestamp, image: arrayBuffer });

            request.onsuccess = function () {
                console.log('Image saved to IndexedDB with timestamp key:', formattedTimestamp);
                clearGalleryImages();
                renderAvailableImagesFromDb();
                renderStorageQuotaInfo();
            };

            request.onerror = function (event) {
                console.error('Error adding image to IndexedDB:', event.target.error);
            };
        };

        reader.readAsArrayBuffer(file);
    };
}

// ...

cancelButton.addEventListener('click', () => {
    previewImage.src = '';
    imageInput.value = '';
});

