// frontend/script.js

document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const searchBtn = document.getElementById('searchBtn');
    const promptMessage = document.getElementById('promptMessage');
    const imageBox = document.getElementById('imageBox');
    const placeholders = document.querySelectorAll('.placeholder'); // Select all placeholders
    const generateMoreBtn = document.getElementById('generateMoreBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');

    searchBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            errorMessage.textContent = 'Please enter a description to generate posters.';
            showElement(errorMessage);
            hideElements([loadingMessage, generateMoreBtn, downloadAllBtn]);
            clearImages();
            promptMessage.textContent = 'Enter a prompt below to generate posters!';
            return;
        }

        showElement(loadingMessage);
        hideElements([errorMessage, generateMoreBtn, downloadAllBtn]);
        clearImages();
        promptMessage.textContent = `Generating posters for: "${prompt}"`;

        try {
            const response = await fetch('http://localhost:3001/generate-poster', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (response.ok) {
                // <--- CHANGED: Now expecting and iterating over 'imageUrls' array
                if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
                    // Loop through the received image URLs and assign them to placeholders
                    data.imageUrls.forEach((url, index) => {
                        if (placeholders[index]) { // Ensure placeholder exists for the index
                            placeholders[index].innerHTML = `<img src="${url}" alt="Generated Poster ${index + 1}">`;
                        }
                    });
                    // If there are fewer images than placeholders, clear remaining ones
                    for(let i = data.imageUrls.length; i < placeholders.length; i++) {
                        placeholders[i].innerHTML = '<p>Empty slot</p>'; // Or leave empty, or add a placeholder message
                    }
                } else {
                    errorMessage.textContent = 'No image URLs received from the server, or response was empty.';
                    showElement(errorMessage);
                }
                // <--- END OF CHANGES

                showElement(generateMoreBtn);
                showElement(downloadAllBtn);
                promptInput.value = '';

            } else {
                errorMessage.textContent = data.error || 'An unexpected error occurred during poster generation.';
                showElement(errorMessage);
                promptMessage.textContent = 'Failed to generate posters.';
            }
        } catch (error) {
            console.error('Network or Fetch API Error:', error);
            errorMessage.textContent = 'Could not connect to the backend server. Please ensure it is running (run "npm start" in the backend folder).';
            showElement(errorMessage);
            promptMessage.textContent = 'Error connecting to server.';
        } finally {
            hideElements([loadingMessage]);
        }
    });

    function showElement(element) {
        element.style.display = 'block';
    }

    function hideElements(elements) {
        elements.forEach(element => {
            element.style.display = 'none';
        });
    }

    function clearImages() {
        placeholders.forEach(placeholder => {
            placeholder.innerHTML = '';
        });
    }

    generateMoreBtn.addEventListener('click', () => {
        alert('Generate more results functionality coming soon!');
    });

    downloadAllBtn.addEventListener('click', () => {
        alert('Download all functionality coming soon!');
    });

    promptInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchBtn.click();
        }
    });
});