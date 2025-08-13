import React, { useState } from "react";
import BUILD_ENV from './Environment';
import FORM_STYLES from './FormStyles';
import {useNavigate} from "react-router-dom";

const LoginPage = () => {

    const navigate = useNavigate();

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
        fetch(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Invalid credentials for '" + email + "'");
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

    const handleSignup = () => {
        return navigate("/signup");
    }

    return (
        <>
            <div style={{marginLeft: 200, width: '90%'}}>
                <img alt="Notes" src="./social-archivr-banner-2.png" />
            </div>
            <div style={FORM_STYLES.container}>
                <form onSubmit={handleSubmit} style={FORM_STYLES.form}>
                    <h2>Login</h2>
                    {errorMessage && <p style={FORM_STYLES.error}>{errorMessage}</p>}
                    <div style={FORM_STYLES.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={FORM_STYLES.input}
                        />
                    </div>
                    <div style={FORM_STYLES.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={FORM_STYLES.input}
                        />
                    </div>
                    <button type="submit" style={FORM_STYLES.button}>
                        Log In
                    </button>
                </form>
                <button onClick={() => handleSignup()} style={{...FORM_STYLES.button, marginTop: 20, width: 300, background: 'green'}}>
                    Sign Up
                </button>
            </div>
        </>
    );
};

export default LoginPage;
