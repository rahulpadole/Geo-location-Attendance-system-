import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function History() {
  const [records, setRecords] = useState([]);
  const uid = auth.currentUser.uid;

  useEffect(() => {
    const loadHistory = async () => {
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", uid),
        orderBy("date", "desc")
      );

      const snap = await getDocs(q);
      setRecords(snap.docs.map((d) => d.data()));
    };

    loadHistory();
  }, [uid]);

  return (
    <div>
      <h2>Attendance History (Last 40 Days)</h2>

      {records.length === 0 ? (
        <p>No records found</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Date</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Status</th>
              <th>Late Reason</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.inTime}</td>
                <td>{r.outTime || "-"}</td>
                <td>{r.status}</td>
                <td>{r.lateReason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
