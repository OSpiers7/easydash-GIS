import React, { useEffect, useRef, useState } from "react";
import "../styles/TopBanner.css";
import "../styles/Menu.css"
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { setUserAuth, clearUserAuth } from "../redux/actions";
import { selectIsUserLoggedIn, selectUserEmail } from "../redux/reducers";
import { supabase } from "../supabaseClient";

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(clearUserAuth());
        setEmail("");
        setPassword("");
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setAuthError('Please enter your email address to reset password.');
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            setAuthError('Failed to send password reset email.');
            console.error("Password reset error:", error.message);
        } else {
            setResetEmailSent(true);
            setAuthError(null);
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
            let result;
            if (isRegistering) {
                result = await supabase.auth.signUp({
                    email,
                    password
                });
            } else {
                result = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
            }

            const { error, data } = result;
            if (error) {
                console.error("Auth error:", error.message);
                setAuthError(error.message);
                return;
            }

            if (data?.user) {
                dispatch(setUserAuth({
                    email: data.user.email || '',
                    isAuthenticated: true
                }));
                setEmail("");
                setPassword("");
                setIsLoginModalOpen(false);
            }

        } catch (error: any) {
            console.error("Unexpected error:", error);
            setAuthError('Unexpected error occurred. Please try again.');
        }
    };

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

    // Add useEffect to check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                dispatch(setUserAuth({
                    email: session.user.email || '',
                    isAuthenticated: true
                }));
            }
        };

        checkSession();
    }, [dispatch]);

    // You can also listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                dispatch(setUserAuth({
                    email: session.user.email || '',
                    isAuthenticated: true
                }));
            } else if (event === 'SIGNED_OUT') {
                dispatch(clearUserAuth());
            }
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [dispatch]);

    return (
      <div className="menu-container" ref={menuRef}>
        <button
          className="menu-button"
          onClick={() => {
            setIsDropDownOpen(!isDropDownOpen);
            console.log("Login button clicked!");
          }}
        >
          Menu
        </button>
        {isDropDownOpen && (
          <div className="menu-dropdown">
            {!isLoggedIn ? (
              <button
                className="login-button"
                onClick={() => setIsLoginModalOpen(true)}
              >
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
          // Applying z-index directly here
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
            {isFieldEmpty && (
              <p className="error-message">
                Email and password cannot be empty
              </p>
            )}
            {authError && <p className="error-message">{authError}</p>}
            {resetEmailSent && (
              <p className="success-message">
                Password reset email sent! Check your inbox.
              </p>
            )}

            <button
              onClick={() => {
           // Debugging log
                handleLoginClick(); // Call your login logic here
              }}
              className="primary-button"
            >
              {isRegistering ? "Register" : "Login"}
            </button>

            {showForgotPassword && (
              <button onClick={handlePasswordReset} className="text-button">
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
              {isRegistering
                ? "Already have an account? Login"
                : "Need an account? Register"}
            </button>
          </div>
        </Modal>
      </div>
    );
};

export default Menu;