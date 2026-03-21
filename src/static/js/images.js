document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'F5' || event.key === 'Escape') {
            event.preventDefault();
            window.location.href = '/upload';
        }
    });

    const fileListWrapper = document.getElementById('file-list-wrapper');
    const uploadRedirectButton = document.getElementById('upload-tab-btn');

    if (uploadRedirectButton) {
        uploadRedirectButton.addEventListener('click', () => {
            window.location.href = '/upload';
        });
    }

    const updateTabStyles = () => {
        const uploadTab = document.getElementById('upload-tab-btn');
        const imagesTab = document.getElementById('images-tab-btn');

        if (!uploadTab || !imagesTab) return;

        const isImagesPage = window.location.pathname.includes('/images-list');

        uploadTab.classList.remove('upload__tab--active');
        imagesTab.classList.remove('upload__tab--active');

        if (isImagesPage) {
            imagesTab.classList.add('upload__tab--active');
        } else {
            uploadTab.classList.add('upload__tab--active');
        }
    };

    const displayFiles = () => {
        const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        fileListWrapper.innerHTML = '';

        if (storedFiles.length === 0) {
            fileListWrapper.innerHTML = `
                <p class="upload__promt" style="text-align: center; margin-top: 50px;">
                    No images uploaded yet.
                </p>
            `;
            return;
        }

        const container = document.createElement('div');
        container.className = 'file-list-container';

        const header = document.createElement('div');
        header.className = 'file-list-header';
        header.innerHTML = `
            <div class="file-col file-col-name">Name</div>
            <div class="file-col file-col-url">Url</div>
            <div class="file-col file-col-delete">Delete</div>
        `;
        container.appendChild(header);

        const list = document.createElement('div');
        list.id = 'file-list';

        storedFiles.forEach((fileData, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-list-item';

            const fileName =
                fileData.displayName ||
                fileData.originalName ||
                fileData.name ||
                `image-${index + 1}`;

            let fileUrl = '#';

            if (fileData.url && !String(fileData.url).startsWith('data:')) {
                fileUrl = fileData.url;
            } else if (fileData.name && !String(fileData.name).startsWith('data:')) {
                fileUrl = `/images/${fileData.name}`;
            }

            const canDelete = !!fileData.name && !String(fileData.name).startsWith('data:');
            const urlText = fileUrl === '#' ? 'Image unavailable' : fileUrl;

            fileItem.innerHTML = `
                <div class="file-col file-col-name">
                    <div class="file-preview-wrapper">
                        ${
                            fileUrl !== '#'
                                ? `<img class="file-preview" src="${fileUrl}" alt="${fileName}">`
                                : `<div class="file-preview file-preview--empty">No image</div>`
                        }
                    </div>
                    <span class="file-name">${fileName}</span>
                </div>
                <div class="file-col file-col-url">
                    ${
                        fileUrl === '#'
                            ? `<span>${urlText}</span>`
                            : `<a href="${fileUrl}" target="_blank">${fileUrl}</a>`
                    }
                </div>
                <div class="file-col file-col-delete">
                    ${
                        canDelete
                            ? `<button class="delete-btn" data-index="${index}">
                                   <img src="/static/img/delete.png" alt="delete icon" class="delete-img">
                               </button>`
                            : `<button class="delete-btn delete-btn--local" data-index="${index}">X</button>`
                    }
                </div>
            `;

            list.appendChild(fileItem);
        });

        container.appendChild(list);
        fileListWrapper.appendChild(container);

        addDeleteListeners();
        updateTabStyles();
    };

    const addDeleteListeners = () => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const indexToDelete = parseInt(event.currentTarget.dataset.index, 10);
                let storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];
                const fileToDelete = storedFiles[indexToDelete];

                if (!fileToDelete) return;

                const isOldBase64Record =
                    (fileToDelete.url && String(fileToDelete.url).startsWith('data:')) ||
                    (fileToDelete.name && String(fileToDelete.name).startsWith('data:'));

                if (!isOldBase64Record && fileToDelete.name) {
                    try {
                        const response = await fetch('/delete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filename: fileToDelete.name })
                        });

                        const result = await response.json();

                        if (!result.success) {
                            console.error('Failed to delete file from server:', result.message);
                        }
                    } catch (error) {
                        console.error('Error deleting file:', error);
                    }
                }

                storedFiles.splice(indexToDelete, 1);
                localStorage.setItem('uploadedImages', JSON.stringify(storedFiles));
                displayFiles();
            });
        });
    };

    updateTabStyles();
    displayFiles();
});