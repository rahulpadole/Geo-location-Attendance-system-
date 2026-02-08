import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadLogs();
  }, []);

  return (
    <div>
      <h2>Admin Audit Logs</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Admin ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.timestamp?.toDate().toLocaleString()}</td>
              <td>{log.adminId}</td>
              <td>{log.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
