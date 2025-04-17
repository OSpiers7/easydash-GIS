import React, { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import "../TopBanner.css";
import "../styles/Menu.css"
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { setUserAuth, clearUserAuth } from "../redux/actions";
import { selectIsUserLoggedIn, selectUserEmail } from "../redux/reducers";

const Menu: React.FC = () => {
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isFieldEmpty, setIsFieldEmpty] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const ReduxKey = useSelector((state: any) => state.geoJsonDataKey);

    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectIsUserLoggedIn);
    const userEmail = useSelector(selectUserEmail);

    const handleLogout = () => {
        dispatch(clearUserAuth());
        setEmail("");
        setPassword("");
    };

    const firebaseConfig = {
        apiKey: "AIzaSyBenD3gr2Pq3vXDTuOLcumE58IJqpS9fGM",
        authDomain: "mapstore3-b157b.firebaseapp.com",
        projectId: "mapstore3-b157b",
        storageBucket: "mapstore3-b157b.firebasestorage.app",
        messagingSenderId: "656740174642",
        appId: "1:656740174642:web:ba7fb17b4c4ca0c94f652b"
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handlePasswordReset = async () => {
        if (!email) {
            setAuthError('Please enter your email address to reset password.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
            setAuthError(null);
        } catch (error: any) {
            switch (error.code) {
                case 'auth/invalid-email':
                    setAuthError('Invalid email address format.');
                    break;
                case 'auth/user-not-found':
                    setAuthError('No account found with this email.');
                    break;
                default:
                    setAuthError('Failed to send password reset email.');
                    console.error("Password reset error:", error);
            }
        }
    };

    const handleLoginClick = async () => {
        if (!email || !password) {
            setIsFieldEmpty(true);
            setAuthError(null);
            return;
        }
        setIsFieldEmpty(false);
        setAuthError(null);
        setResetEmailSent(false);
    
        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("User registered:", userCredential.user);
                dispatch(setUserAuth({
                    email: userCredential.user.email || '',
                    isAuthenticated: true
                }));
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("User logged in:", userCredential.user);
                dispatch(setUserAuth({
                    email: userCredential.user.email || '',
                    isAuthenticated: true
                }));
            }
            
            setEmail("");
            setPassword("");
            setIsLoginModalOpen(false);
            
        } catch (error: any) {
            console.error("Auth error code:", error.code); // Add this for debugging
            switch (error.code) {
                case 'auth/invalid-email':
                    setAuthError('Invalid email address format.');
                    break;
                case 'auth/user-not-found':
                    setAuthError('No user found with this email.');
                    break;
                case 'auth/wrong-password':
                    setAuthError('Incorrect password.');
                    break;
                case 'auth/weak-password':
                    setAuthError('Password should be at least 6 characters.');
                    break;
                case 'auth/email-already-exists':
                case 'auth/email-already-in-use':
                    setAuthError('Email already registered. Try logging in instead.');
                    break;
                case 'auth/too-many-requests':
                    setAuthError('Too many failed attempts. Please try again later.');
                    break;
                case 'auth/operation-not-allowed':
                    setAuthError('Email/password sign-in is not enabled. Please contact support.');
                    break;
                case 'auth/network-request-failed':
                    setAuthError('Network error. Please check your internet connection.');
                    break;
                default:
                    setAuthError(`Authentication error: ${error.code}`);
                    console.error("Detailed auth error:", error);
            }
        }
    };

    // Check if there's a login-related error
    const showForgotPassword = !isRegistering && authError;

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsDropDownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="menu-container" ref={menuRef}>
            <button className="menu-button" onClick={() => {setIsDropDownOpen(!isDropDownOpen)}}>
                Menu
            </button>
            {isDropDownOpen && (
                <div className="menu-dropdown">
                    {!isLoggedIn ? (
                        <button className="login-button" onClick={() => setIsLoginModalOpen(true)}>
                            Login
                        </button>
                    ) : (
                        <>
                            <div className="user-email">{userEmail}</div>
                            <button className="logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => {
                    setIsLoginModalOpen(false);
                    setAuthError(null);
                    setIsFieldEmpty(false);
                    setResetEmailSent(false);
                }}
                title={isRegistering ? "Create Account" : "Login"}
            >
                <div className="modal-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="modal-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="modal-input"
                    />
                    {isFieldEmpty && <p className="error-message">Email and password cannot be empty</p>}
                    {authError && <p className="error-message">{authError}</p>}
                    {resetEmailSent && <p className="success-message">Password reset email sent! Check your inbox.</p>}
                    <button 
                        onClick={handleLoginClick}
                        className="primary-button"
                    >
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                    {showForgotPassword && (
                        <button 
                            onClick={handlePasswordReset}
                            className="text-button"
                        >
                            Forgot Password?
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setAuthError(null);
                            setResetEmailSent(false);
                        }}
                        className="text-button"
                    >
                        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Menu;