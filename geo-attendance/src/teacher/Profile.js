import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";

export default function TeacherProfile() {
  const [user, setUser] = useState(null);
  const [contact, setContact] = useState("");

  const uid = auth.currentUser.uid;

  useEffect(() => {
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setUser(snap.data());
        setContact(snap.data().contact || "");
      }
    };
    loadProfile();
  }, [uid]);

  const updateProfile = async () => {
    await updateDoc(doc(db, "users", uid), {
      contact,
    });
    alert("Profile updated");
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? Your attendance data will remain.")) return;

    await deleteUser(auth.currentUser);
    alert("Account deleted");
    window.location.href = "/login";
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Profile</h2>

      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Department:</b> {user.department}</p>
      <p><b>Position:</b> {user.position}</p>

      <label>Contact Number</label>
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />

      <br /><br />

      <button onClick={updateProfile}>Update</button>
      <button onClick={logout}>Logout</button>
      <button onClick={deleteAccount} style={{ color: "red" }}>
        Delete Account
      </button>
    </div>
  );
}
