import React, { useState } from "react";
import BUILD_ENV from './Environment';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        setErrorMessage("");

        // Example: Send to your backend
        fetch(`http://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Invalid credentials for \'" + email + "\'");
                }
                return res.json();
            })
            .then(data => {
                console.log("Logged in!", data);
                localStorage.setItem('authToken', JSON.stringify(data));
                window.location.href = "/";
            })
            .catch((err) => {
                setErrorMessage(err.message);
            });
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Login</h2>
                {errorMessage && <p style={styles.error}>{errorMessage}</p>}
                <div style={styles.inputGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Log In
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        height: "100vh",
        justifyContent: "center",
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

export default LoginPage;
