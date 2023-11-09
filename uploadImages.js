const apiUrl = 'https://cqiixj66hi.execute-api.us-west-1.amazonaws.com/dev/mvrs/';

function uploadImages() {
    const request = indexedDB.open(dbName, 1);

    request.onsuccess = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(objectStoreName)) {
            // If the object store doesn't exist, simply continue without attempting uploads.
            db.close();
            return;
        }

        const transaction = db.transaction(objectStoreName, 'readonly');
        const store = transaction.objectStore(objectStoreName);

        store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                const timestamp = cursor.key;
                const imageFile = cursor.value.file;

                // Upload the image to the API
                uploadImageToAPI(apiUrl, timestamp, imageFile);

                // Continue iterating through images
                cursor.continue();
            }
        };

        transaction.oncomplete = function () {
            db.close();
        };
    };
}

function uploadImageToAPI(apiUrl, timestamp, imageFile) {
    const requestOptions = {
        method: 'PUT',
        body: imageFile,
        mode: 'cors',
        headers: {
            'Content-Type': 'image/jpg', // Adjust the content type as needed
            'Origin': 'https://jacklyno.github.io/'
        },
    };

    fetch(apiUrl + timestamp + '.jpg', requestOptions)
        .then((response) => {
            if (response.ok) {
                // Image uploaded successfully, you may want to remove it from IndexedDB
                console.log('Image uploaded successfully');
            } else {
                console.error('Error uploading image:', response.status, response.statusText);
            }
        })
        .catch((error) => {
            console.error('Error uploading image:', error);
        });
}

// Set up periodic image upload (adjust the interval as needed)
const uploadInterval = 5000; // Upload every 5 seconds
setInterval(uploadImages, uploadInterval);

