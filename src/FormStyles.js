const FORM_STYLES = {
    container: {
        display: "flex",
        height: "66vh",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        background: "#f3f4f6",
    },
    form: {
        background: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        width: "300px",
    },
    inputGroup: {
        marginBottom: "1rem",
    },
    input: {
        width: "100%",
        padding: "0.5rem",
        fontSize: "1rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    button: {
        width: "100%",
        padding: "0.75rem",
        background: "#2563eb",
        color: "white",
        fontSize: "1rem",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    error: {
        color: "red",
        marginBottom: "1rem",
    },
};

export default FORM_STYLES;
