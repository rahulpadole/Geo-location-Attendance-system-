import { auth } from "../services/firebase";
import { signOut, deleteUser } from "firebase/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
    if (!window.confirm("⚠️ Are you sure you want to delete your account?")) return;

    try {
      setLoading(true);
      await deleteUser(auth.currentUser);
      alert("✅ Account deleted successfully");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting account: " + err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar role="admin" />
      <div style={{ maxWidth: 500, margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8, textAlign: "center" }}>
        <h2>Admin Profile</h2>
        <p>Email: <strong>{auth.currentUser?.email}</strong></p>

        <button
          onClick={logout}
          disabled={loading}
          style={{ padding: "10px 20px", margin: "10px", cursor: "pointer" }}
        >
          {loading ? "Processing..." : "Logout"}
        </button>

        <button
          onClick={deleteAccount}
          disabled={loading}
          style={{ padding: "10px 20px", margin: "10px", cursor: "pointer", backgroundColor: "#f44336", color: "#fff" }}
        >
          {loading ? "Processing..." : "Delete Account"}
        </button>
      </div>
      <Footer />
    </>
  );
}
