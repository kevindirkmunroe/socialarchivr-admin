import React, { useState } from 'react'
import Avatar from 'react-avatar-edit'

const ProfileImageModal = (userProfileImageUrl) => {
    const [isOpen, setIsOpen] = useState(false)
    const [preview, setPreview] = useState(userProfileImageUrl)

    const handleCrop = (view) => setPreview(view)
    const handleClose = () => setPreview(null)

    const handleSave = () => {
        // TODO: send `preview` to backend or state
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
