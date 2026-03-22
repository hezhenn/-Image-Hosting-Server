document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'F5' || event.key === 'Escape') {
            event.preventDefault();
            window.location.href = '/upload';
        }
    });

    const fileListWrapper = document.getElementById('file-list-wrapper');
    if (!fileListWrapper) return;

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

    const renderPagination = (currentPage, total) => {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(total / 10) || 1;
        let paginationHtml = '';

        if (currentPage > 1) {
            paginationHtml += `<button id="prev-page-btn">Previous</button>`;
        }

        paginationHtml += `<span style="margin: 0 10px;">Page ${currentPage} of ${totalPages}</span>`;

        if (currentPage < totalPages) {
            paginationHtml += `<button id="next-page-btn">Next</button>`;
        }

        pagination.innerHTML = paginationHtml;

        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => displayFiles(currentPage - 1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => displayFiles(currentPage + 1));
        }
    };

    const displayFiles = async (page = 1) => {
        try {
            fileListWrapper.innerHTML = '';

            const response = await fetch(`/api/images-list?page=${page}`);
            const result = await response.json();

            if (!result.success) {
                fileListWrapper.innerHTML = `
                    <p class="upload__promt" style="text-align: center; margin-top: 50px;">
                        Failed to load images.
                    </p>
                `;
                return;
            }

            const storedFiles = result.images || [];
            const total = result.total || 0;
            const currentPage = result.page || page;

            if (storedFiles.length === 0) {
                fileListWrapper.innerHTML = `
                    <p class="upload__promt" style="text-align: center; margin-top: 50px;">
                        No images uploaded yet.
                    </p>
                `;
                renderPagination(currentPage, total);
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
                    fileData.original_name ||
                    fileData.filename ||
                    `image-${index + 1}`;

                let fileUrl = '#';

                if (fileData.url && !String(fileData.url).startsWith('data:')) {
                    fileUrl = fileData.url;
                } else if (fileData.filename) {
                    fileUrl = `/images/${fileData.filename}`;
                }

                const canDelete = !!fileData.id;
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
                                ? `<button class="delete-btn" data-id="${fileData.id}">
                                       <img src="/static/img/delete.png" alt="delete icon" class="delete-img">
                                   </button>`
                                : `<button class="delete-btn" disabled>X</button>`
                        }
                    </div>
                `;

                list.appendChild(fileItem);
            });

            container.appendChild(list);
            fileListWrapper.appendChild(container);

            addDeleteListeners(currentPage);
            renderPagination(currentPage, total);
            updateTabStyles();
        } catch (error) {
            console.error('Error loading images:', error);
            fileListWrapper.innerHTML = `
                <p class="upload__promt" style="text-align: center; margin-top: 50px;">
                    Failed to load images.
                </p>
            `;
        }
    };

    const addDeleteListeners = (currentPage) => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const imageId = parseInt(event.currentTarget.dataset.id, 10);

                if (!imageId) return;

                try {
                    const response = await fetch(`/delete/${imageId}`, {
                        method: 'POST'
                    });

                    if (!response.ok) {
                        console.error('Failed to delete image');
                        return;
                    }

                    await displayFiles(currentPage);
                } catch (error) {
                    console.error('Error deleting file:', error);
                }
            });
        });
    };

    updateTabStyles();
    displayFiles();
});