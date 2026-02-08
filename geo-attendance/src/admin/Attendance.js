import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs, updateDoc, doc, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "attendance"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      alert("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, field, value) => {
    try {
      const docRef = doc(db, "attendance", id);
      await updateDoc(docRef, { [field]: value });

      // Audit log
      await addDoc(collection(db, "auditLogs"), {
        adminId: auth.currentUser.uid,
        action: `Edited ${field} of attendance ${id} → ${value}`,
        timestamp: serverTimestamp(),
      });

      alert("Attendance updated");
      loadAttendance();
    } catch (err) {
      console.error(err);
      alert("Error updating attendance: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Attendance Records</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Date</th>
            <th>Teacher</th>
            <th>In Time</th>
            <th>Out Time</th>
            <th>Status</th>
            <th>Late Reason</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>{r.teacherName || r.userId}</td>
              <td>
                <input
                  type="time"
                  value={r.inTime || ""}
                  onChange={(e) => handleEdit(r.id, "inTime", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={r.outTime || ""}
                  onChange={(e) => handleEdit(r.id, "outTime", e.target.value)}
                />
              </td>
              <td>{r.status}</td>
              <td>
                <input
                  type="text"
                  value={r.lateReason || ""}
                  placeholder="Late reason"
                  onChange={(e) => handleEdit(r.id, "lateReason", e.target.value)}
                />
              </td>
              <td>Edit</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
