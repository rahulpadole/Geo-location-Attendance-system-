import { auth } from "../services/firebase";
import { signOut, deleteUser } from "firebase/auth";

export default function AdminProfile() {
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const deleteAccount = async () => {
    if (window.confirm("Delete account?")) {
      await deleteUser(auth.currentUser);
      window.location.href = "/login";
    }
  };

  return (
    <div>
      <h2>Admin Profile</h2>
      <button onClick={logout}>Logout</button>
      <button onClick={deleteAccount}>Delete Account</button>
    </div>
  );
}
