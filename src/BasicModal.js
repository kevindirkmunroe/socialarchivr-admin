import React from "react";

const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
        border: "none",
        background: "transparent",
        fontSize: "18px",
        cursor: "pointer",
    },
};

const BasicModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div
                style={modalStyles.modal}
                onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing when clicking inside modal
            >
                <button style={modalStyles.closeButton} onClick={onClose}>
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

export default BasicModal;
