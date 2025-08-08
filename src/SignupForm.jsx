import React, { useState } from "react";

/**
 * SignupForm
 * - Tailwind-based
 * - POSTs JSON to /api/signup  (adjust endpoint as needed)
 */
export default function SignupForm() {
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
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    password, // recommend hashing on server side / use HTTPS
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `Signup failed (${res.status})`);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">Create an account</h2>

                {error && (
                    <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 text-sm text-green-800 bg-green-100 p-2 rounded">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">First name</label>
                            <input
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Last name</label>
                            <input
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                        {!isEmailValid(email) && email.length > 0 && (
                            <p className="text-xs text-red-600 mt-1">Enter a valid email.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {!isPasswordValid(password) && password.length > 0 && (
                            <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters.</p>
                        )}
                    </div>

                    <button
                        disabled={!isFormValid() || loading}
                        type="submit"
                        className={`w-full py-2 rounded text-white font-medium ${
                            !isFormValid() || loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Signing up…" : "Sign up"}
                    </button>
                </form>

                <p className="text-xs text-gray-500 mt-4 text-center">
                    By continuing, you agree to our terms and privacy policy.
                </p>
            </div>
        </div>
    );
}
