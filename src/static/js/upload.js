document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'F5') {
            event.preventDefault();
            window.location.href = '/upload';
        }
    });

    const fileUpload = document.getElementById('file-upload');
    const imagesButton = document.getElementById('images-tab-btn');
    const dropzone = document.querySelector('.upload__dropzone');
    const currentUploadInput = document.querySelector('.upload__input');
    const copyButton = document.querySelector('.upload__copy');

    if (imagesButton) {
        imagesButton.addEventListener('click', () => {
            window.location.href = '/images-list';
        });
    }

    const showMessage = (message, isError = false) => {
        let msgEl = document.querySelector('.upload__message');

        if (!msgEl) {
            msgEl = document.createElement('p');
            msgEl.className = 'upload__message';
            dropzone?.parentNode?.insertBefore(msgEl, dropzone.nextSibling);
        }

        msgEl.textContent = message;
        msgEl.style.color = isError ? '#e53e3e' : '#38a169';
    };

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

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];

                const getNextImageNumber = () => {
                    return storedFiles.filter(f => f.displayName && f.displayName.startsWith('image')).length + 1;
                };

                const extIndex = file.name.lastIndexOf('.');
                const ext = extIndex !== -1 ? file.name.substring(extIndex) : '';
                const displayName = `image${String(getNextImageNumber()).padStart(2, '0')}${ext}`;

                const newFileData = {
                    name: data.filename,
                    displayName: displayName,
                    originalName: file.name,
                    url: `/images/${data.filename}`
                };

                storedFiles.push(newFileData);
                localStorage.setItem('uploadedImages', JSON.stringify(storedFiles));

                if (currentUploadInput) {
                    currentUploadInput.value = `${window.location.origin}/images/${data.filename}`;
                }

                updateTabStyles();
                showMessage('File uploaded successfully!');
            } else {
                showMessage(data.message || 'Upload failed.', true);
            }
        } catch (err) {
            console.error(err);
            showMessage('Something went wrong. Please try again.', true);
        }
    };

    const handleAndStoreFiles = async (files) => {
        if (!files || files.length === 0) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                showMessage(`File "${file.name}" has unsupported type.`, true);
                continue;
            }

            if (file.size > MAX_SIZE_BYTES) {
                showMessage(`File "${file.name}" is larger than 5MB.`, true);
                continue;
            }

            await uploadFile(file);
        }
    };

    if (copyButton && currentUploadInput) {
        copyButton.addEventListener('click', () => {
            const textToCopy = currentUploadInput.value;

            if (textToCopy && textToCopy !== 'https://') {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyButton.textContent = 'COPIED!';
                    setTimeout(() => {
                        copyButton.textContent = 'COPY';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text:', err);
                });
            }
        });
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', async (event) => {
            await handleAndStoreFiles(event.target.files);
            event.target.value = '';
        });
    }

    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropzone.addEventListener('dragenter', () => dropzone.classList.add('dragover'));
        dropzone.addEventListener('dragover', () => dropzone.classList.add('dragover'));
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', async (event) => {
            dropzone.classList.remove('dragover');
            await handleAndStoreFiles(event.dataTransfer.files);
        });
    }

    updateTabStyles();
});