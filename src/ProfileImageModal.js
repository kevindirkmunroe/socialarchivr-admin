import React, {useEffect, useState} from 'react'
import Avatar from 'react-avatar-edit'
import BUILD_ENV from "./Environment";

const ProfileImageModal = (savedImage) => {
    const userId = JSON.parse(localStorage.getItem('authToken')).userId;
    const [isOpen, setIsOpen] = useState(false)
    const [preview, setPreview] = useState(null);
    const [tempPreview, setTempPreview] = useState(null);

    const loadImage = (url) => {
        return new Promise((resolve) => {
            const img = new Image();                // 1. Create a new <img> element in memory
            img.crossOrigin = 'anonymous';          // 2. Allow cross-origin data access (important if you load from API blob)
            img.onload = () => resolve(img);        // 3. Once loaded, resolve the promise with the <img> element
            img.src = url;                          // 4. Trigger the actual image loading
        });
    };

    function dataURLtoBlob(dataURL) {
        // Split into "data:[mime];base64,[data]"
        const [header, base64Data] = dataURL.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(base64Data); // decode base64 to binary string
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        return new Blob([array], { type: mime });
    }

    const handleCrop = (view) => setTempPreview(view)
    const handleClose = () => setPreview(null)

    useEffect(() => {
        const cropToSquare = async (url) => {
            const img = await loadImage(url);
            const size = Math.min(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(
                img,
                (img.width - size) / 2,
                (img.height - size) / 2,
                size,
                size,
                0,
                0,
                size,
                size
            );
            return canvas.toDataURL(); // or convert to blob and use URL.createObjectURL(blob)
        };

        if (savedImage?.savedImage) {
            cropToSquare(savedImage.savedImage).then(croppedBlobUrl => {
                setPreview(croppedBlobUrl);
            });
        }
    }, [savedImage]);

    async function saveProfileImage() {
        const blob = dataURLtoBlob(tempPreview);

        const formData = new FormData();
        formData.append("profileImage", blob, "profileImage");
        return fetch(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/users/${userId}/profile-image`, {
            method: "POST",
            body: formData
        });
    }

    const handleSave = async () => {
        await saveProfileImage();
        setPreview(tempPreview);
        setIsOpen(false)
    }

    return (
        <div className="text-center">
            { !preview && (
                <>
                    <img alt="generic-profile-pic" src="./generic-profile.png" style={{width:  80, height: 80}} onClick={() => setIsOpen(true)}/>
                </>
            )}

            {/* Preview thumbnail */}
            {preview && (
                <div className="mt-4">
                    <img
                        src={preview}
                        alt="Selected avatar"
                        className="w-24 h-24 rounded-full border"
                        style={{
                            width: 128,
                            height: 128,
                            borderRadius: '50%',
                            objectFit: 'cover',
                        }}
                        onClick={() => setIsOpen(true)}
                    />
                </div>
            )}

            <img onClick={() => setIsOpen(true)} alt="camera" src="./icons8-camera-50.png" style={{width:  20, height: 20}}/>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[420px]">
                        <h2 className="text-lg font-semibold mb-4">Edit Profile Image</h2>
                        <Avatar
                            width={380}
                            height={295}
                            onCrop={handleCrop}
                            onClose={handleClose}
                            onClick={() => setIsOpen(true)}
                            src={null}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileImageModal
