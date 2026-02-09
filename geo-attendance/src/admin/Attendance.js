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
  serverTimestamp,
} from "firebase/firestore";

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const q = query(
        collection(db, "attendance"),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setRecords(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (attendanceId, field, value) => {
    try {
      const ref = doc(db, "attendance", attendanceId);
      await updateDoc(ref, { [field]: value });

      // Audit log
      await addDoc(collection(db, "auditLogs"), {
        adminId: auth.currentUser.uid,
        action: `Updated ${field} for attendance ${attendanceId}`,
        timestamp: serverTimestamp(),
      });

      // Update UI instantly
      setRecords((prev) =>
        prev.map((r) =>
          r.id === attendanceId ? { ...r, [field]: value } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Update failed: " + err.message);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto" }}>
      <h2 style={{ textAlign: "center" }}>Attendance Records</h2>

      {records.length === 0 ? (
        <p style={{ textAlign: "center" }}>No records found</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="8"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 20,
            }}
          >
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th>Date</th>
                <th>Teacher</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Status</th>
                <th>Late Reason</th>
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
                      onChange={(e) =>
                        updateField(r.id, "inTime", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      value={r.outTime || ""}
                      onChange={(e) =>
                        updateField(r.id, "outTime", e.target.value)
                      }
                    />
                  </td>

                  <td>{r.status}</td>

                  <td>
                    <input
                      type="text"
                      value={r.lateReason || ""}
                      placeholder="Optional"
                      onChange={(e) =>
                        updateField(r.id, "lateReason", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
