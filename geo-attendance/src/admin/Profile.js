import { auth } from "../services/firebase";
import { signOut, deleteUser } from "firebase/auth";
import { useState } from "react";

export default function AdminProfile() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Error logging out: " + err.message);
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure you want to permanently delete your account?")) return;

    try {
      setLoading(true);
      await deleteUser(auth.currentUser);
      alert("✅ Account deleted successfully");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert(
        err.code === "auth/requires-recent-login"
          ? "❌ Please re-login before deleting account"
          : "❌ Error deleting account: " + err.message
      );
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>Admin Profile</h2>

      <p>
        <strong>Email:</strong>{" "}
        {auth.currentUser?.email || "Not available"}
      </p>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={logout}
          disabled={loading}
          style={{ padding: "10px 20px", marginRight: 10 }}
        >
          {loading ? "Processing..." : "Logout"}
        </button>

        <button
          onClick={deleteAccount}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Processing..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}
