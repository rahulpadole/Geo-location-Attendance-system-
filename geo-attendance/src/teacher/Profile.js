import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";

export default function TeacherProfile() {
  const [user, setUser] = useState(null);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const uid = auth.currentUser.uid;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setUser(snap.data());
          setContact(snap.data().contact || "");
        } else {
          alert("User not found");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load profile: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [uid]);

  const updateProfile = async () => {
    if (!contact) return alert("Please enter a valid contact number");
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", uid), { contact });
      alert("✅ Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Failed to logout: " + err.message);
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account? Your attendance data will remain.")) return;

    try {
      setLoading(true);
      await deleteUser(auth.currentUser);
      alert("✅ Account deleted");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete account: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <p>Loading profile...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>My Profile</h2>
      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Department:</b> {user.department}</p>
      <p><b>Position:</b> {user.position || "-"}</p>

      <label>Contact Number:</label>
      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        style={{ width: "100%", padding: 6, margin: "8px 0" }}
      />

      <button onClick={updateProfile} disabled={loading} style={{ marginRight: 10 }}>
        {loading ? "Updating..." : "Update"}
      </button>
      <button onClick={logout} disabled={loading} style={{ marginRight: 10 }}>
        Logout
      </button>
      <button onClick={deleteAccount} disabled={loading} style={{ color: "red" }}>
        Delete Account
      </button>
    </div>
  );
}
