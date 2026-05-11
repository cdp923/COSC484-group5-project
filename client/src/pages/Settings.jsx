import { useEffect, useState } from "react";
import { useAuthFetch, API_BASE } from "../lib/authFetch";
import "./styles/settings.css";

const USER_URL = `${API_BASE}/users/me`;

export default function Settings() {
  const authFetch = useAuthFetch();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // Password change state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function loadUserProfile() {
    try {
      const data = await authFetch(USER_URL);
      setUser(data);
    } catch (err) {
      if (err.message !== "Unauthorized") setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      await authFetch(USER_URL, {
        method: "PATCH",
        body: JSON.stringify({ password }),
      });
      setSuccess("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>
      
      {user && (
        <div className="profile-info">
          <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
        </div>
      )}
      <hr />
{!showPasswordForm ? (
    <button 
      className="btn btn-secondary" 
      onClick={() => setShowPasswordForm(true)}
    >
      Change Password
    </button>
  ) : (
    <>
      <h3>Change Password</h3>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <form className="settings-form" onSubmit={handlePasswordUpdate}>
        <label>New Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />

        <label>Confirm New Password</label>
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />

        <div className="settings-actions">
            <button className="btn btn-primary" type="submit">
            Update Password
            </button>
            <button 
            type="button"
            className="btn btn-link" 
            onClick={() => {
                setShowPasswordForm(false);
                setError(null);
                setSuccess(null);
            }}
            >
            Cancel
            </button>
        </div>
      </form>
    </>
  )}
</div>
);
}