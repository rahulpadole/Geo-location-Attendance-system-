import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

      // Update local state immediately
      setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    } catch (err) {
      console.error(err);
      alert("Error updating attendance: " + err.message);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading attendance records...</p>;

  return (
    <>
      <Navbar role="admin" />
      <div style={{ maxWidth: 1000, margin: "40px auto", textAlign: "center" }}>
        <h2>Attendance Records</h2>

        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f0f0f0" }}>
              <tr>
                <th>Date</th>
                <th>Teacher</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Status</th>
                <th>Late Reason</th>
                <th>Action</th>
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
                  <td>
                    <button
                      onClick={() => alert("Values updated automatically")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 4,
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      ✅
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}
