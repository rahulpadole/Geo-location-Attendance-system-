import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading audit logs:", err);
        alert("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  if (loading)
    return (
      <>
        <Navbar role="admin" />
        <p style={{ textAlign: "center", marginTop: 50 }}>Loading audit logs...</p>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar role="admin" />
      <div style={{ maxWidth: 1000, margin: "40px auto", textAlign: "center" }}>
        <h2>Admin Audit Logs</h2>
        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
          >
            <thead style={{ background: "#f0f0f0" }}>
              <tr>
                <th>Date / Time</th>
                <th>Admin ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.timestamp?.toDate().toLocaleString() || "-"}</td>
                    <td>{log.adminId}</td>
                    <td>{log.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}
