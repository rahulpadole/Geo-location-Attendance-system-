import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      const user = auth.currentUser;

      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 🔹 Last 40 records (safe & index-free)
        const q = query(
          collection(db, "attendance"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(40)
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            date:
              d.date ||
              (d.timestamp
                ? d.timestamp.toDate().toISOString().split("T")[0]
                : "-"),
            inTime: d.inTime || "-",
            outTime: d.outTime || "-",
            status: d.status || "-",
            lateReason: d.lateReason || "-",
          };
        });

        setRecords(data);
      } catch (err) {
        console.error("History error:", err);
        setError("Failed to load attendance history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading attendance history...</p>;
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        {error}
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>
        Attendance History (Last 40 Records)
      </h2>

      {records.length === 0 ? (
        <p style={{ textAlign: "center" }}>No attendance records found</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>Date</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Status</th>
              <th>Late Reason</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{r.date}</td>
                <td>{r.inTime}</td>
                <td>{r.outTime}</td>
                <td>{r.status}</td>
                <td>{r.lateReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
