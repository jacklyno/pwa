const apiUrl = 'https://cqiixj66hi.execute-api.us-west-1.amazonaws.com/dev/mvrs/';

function uploadImages() {
    const request = indexedDB.open(dbName, 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(objectStoreName, 'readonly');
        const store = transaction.objectStore(objectStoreName);

        store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                const timestamp = cursor.key;
                const imageFile = cursor.value.file;

                // Upload the image to the API
                const filename = `image-${timestamp}.jpg`; // Customize the filename as needed
                uploadImageToAPI(apiUrl + filename, imageFile);

                // Continue iterating through images
                cursor.continue();
            }
        };

        transaction.oncomplete = function () {
            db.close();
        };
    };
}

function uploadImageToAPI(apiUrl, imageFile) {
    // Create a FormData object to send the image in binary format
    const formData = new FormData();
    formData.append('file', imageFile);

    fetch(apiUrl, {
        method: 'POST',
        body: formData,
    })
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
