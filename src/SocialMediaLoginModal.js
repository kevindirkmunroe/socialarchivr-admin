import React, { useEffect, useState } from 'react';
import { LoginSocialFacebook } from 'reactjs-social-login'; // adjust if using a different lib
import BUILD_ENV from './Environment';

export default function SocialMediaLoginModal({ show, onClose, accessToken, onLoginSuccess }) {

    const [authFailed, setAuthFailed] = useState(false);

    useEffect(() => {
        if (accessToken) {
            // Try using existing token
            fetch('/api/verify-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Token invalid');
                    return res.json();
                })
                .then(data => {
                    onLoginSuccess(data);
                    onClose();
                })
                .catch(() => setAuthFailed(true));
        } else {
            setAuthFailed(true);
        }
    }, [accessToken, onLoginSuccess, onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4">Login to Facebook</h2>

                {authFailed ? (
                    <LoginSocialFacebook
                        appId={BUILD_ENV.APP_ID}
                        onResolve={({ data }) => {
                            onLoginSuccess(data);
                            onClose();
                        }}
                        onReject={(err) => console.error('FB login failed', err)}
                    >
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">Login with Facebook</button>
                    </LoginSocialFacebook>
                ) : (
                    <p>Verifying existing session...</p>
                )}
            </div>
        </div>
    );
}
