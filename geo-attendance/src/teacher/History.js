import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser.uid;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const past40Days = new Date();
        past40Days.setDate(today.getDate() - 40);

        // Firestore stores timestamps, so we use serverTimestamp range
        const q = query(
          collection(db, "attendance"),
          where("userId", "==", uid),
          where("timestamp", ">=", past40Days),
          orderBy("timestamp", "desc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date || doc.data().timestamp?.toDate().toISOString().split("T")[0],
        }));
        setRecords(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [uid]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading attendance history...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
      <h2>Attendance History (Last 40 Days)</h2>

      {records.length === 0 ? (
        <p>No records found</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>Date</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Status</th>
              <th>Late Reason</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{r.date || "-"}</td>
                <td>{r.inTime || "-"}</td>
                <td>{r.outTime || "-"}</td>
                <td>{r.status || "-"}</td>
                <td>{r.lateReason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
