import React, { useState } from "react";
import FORM_STYLES from "./FormStyles";
import { useNavigate} from "react-router-dom";
import BUILD_ENV from "./Environment";

/**
 * SignupForm
 * - Tailwind-based
 * - POSTs JSON to /api/signup  (adjust endpoint as needed)
 */
export default function SignupForm() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName]   = useState("");
    const [email, setEmail]         = useState("");
    const [password, setPassword]   = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);
    const [success, setSuccess]     = useState(null);

    // Basic validators
    const isEmailValid = (e) => /\S+@\S+\.\S+/.test(e);
    const isPasswordValid = (p) => p.length >= 8; // tweak as needed
    const isFormValid = () =>
        firstName.trim() &&
        lastName.trim() &&
        isEmailValid(email) &&
        isPasswordValid(password);

    const handleGotoLogin = () => {
        navigate('/login');
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isFormValid()) {
            setError("Please fill all fields with valid values. Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BUILD_ENV.PROTOCOL}://${BUILD_ENV.SERVICE_DOMAIN}:${BUILD_ENV.SERVICE_PORT}/api/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstname: firstName.trim(),
                    lastname: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    password, // recommend hashing on server side / use HTTPS
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(`Uh Oh, Sign Up Failed! ${body.message || `(${res.status})`}`);
            }

            setSuccess("Signup successful! Please check your email to confirm your account.");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{marginLeft: 200, width: '90%'}}>
                <img alt="Notes" src="./social-archivr-banner-2.png" />
            </div>
            <div style={FORM_STYLES.container}>
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>

                    {error && (
                        <div style={{color: "red", marginBottom: 12}}>
                           {error}
                        </div>
                    )}

                    {success && (
                        <div style={{color: "green", margin: 4}}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={FORM_STYLES.form} noValidate>
                        <div style={FORM_STYLES.inputGroup}>
                            <label className="block text-sm font-medium mb-1">First name</label>
                            <input
                                style={FORM_STYLES.input}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First"
                                required
                            />
                        </div>
                        <div style={FORM_STYLES.inputGroup}>
                            <label className="block text-sm font-medium mb-1">Last name</label>
                            <input
                                style={FORM_STYLES.input}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last"
                                required
                            />
                        </div>
                        <div style={FORM_STYLES.inputGroup}>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                style={FORM_STYLES.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                            {!isEmailValid(email) && email.length > 0 && (
                                <p className="text-xs text-red-600 mt-1"><img style={{width: 18, height: 18, marginRight: 4}} alt="warning" src={"./icons8-warning-48.png"} />Enter a valid email.</p>
                            )}
                        </div>
                        <div style={FORM_STYLES.inputGroup}>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    style={FORM_STYLES.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    style={{marginTop: 4}}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {!isPasswordValid(password) && password.length > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                    <img style={{width: 18, height: 18, marginRight: 4}} alt="warning" src={"./icons8-warning-48.png"} />Password must be at least 8 characters.</p>
                            )}
                        </div>

                        <button
                            disabled={!isFormValid() || loading}
                            type="submit"
                            style={{...FORM_STYLES.button,
                                backgroundColor: isFormValid() ? "#4CAF50" : "#ccc",
                                cursor: isFormValid() ? "pointer" : "not-allowed"}}>
                            {loading ? "Signing up…" : "Sign up"}
                        </button>
                        <div onClick={() => handleGotoLogin()} style={{marginTop: 6, fontSize: 14, color: 'green', cursor: 'pointer'}}>Back To Login</div>
                    </form>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                        By continuing, you agree to our terms and privacy policy.
                    </p>
                </div>
            </div>
        </>
    );
}
