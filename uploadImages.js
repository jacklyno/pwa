
const apiUrl = 'https://cqiixj66hi.execute-api.us-west-1.amazonaws.com/dev/mvrs/';

// Function to upload images from IndexedDB to the API
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
                const filename = `image-${timestamp}.jpg`; // Customize the filename as needed

                // Make the PUT request to your API with the image data
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

// Function to upload an image to the API
function uploadImageToAPI(apiUrl, imageFile) {
    // Create a FormData object to send the image in binary format
    const formData = new FormData();
    formData.append('file', imageFile);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "image/jpeg");

    const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: formData,
        redirect: 'follow',
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            if (response.ok) {
                // Image uploaded successfully, you may want to remove it from IndexedDB
                console.log('Image uploaded successfully');
                // You can add a call to remove the image from IndexedDB here
            } else {
                console.error('Error uploading image:', response.status, response.statusText);
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
}

// Set up periodic image upload (adjust the interval as needed)
const uploadInterval = 5000; // Upload every 5 seconds
setInterval(uploadImages, uploadInterval);
