import { useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  const cleanOldAttendance = async () => {
    if (!window.confirm("This will delete all attendance older than 40 days. Continue?")) return;

    setLoading(true);

    try {
      const now = new Date();
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 40);
      const cutoffDate = cutoff.toISOString().split("T")[0];

      const q = query(
        collection(db, "attendance"),
        where("date", "<", cutoffDate)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("No old attendance records found");
        setLoading(false);
        return;
      }

      const batch = writeBatch(db);

      snap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      alert(`Deleted ${snap.size} old attendance records`);
    } catch (err) {
      console.error(err);
      alert("Error deleting old attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <button onClick={cleanOldAttendance} disabled={loading}>
        {loading ? "Cleaning..." : "Clean Old Attendance (40+ days)"}
      </button>

      {/* Other dashboard content here */}
    </div>
  );
}
