import { useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Export() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadAttendance = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, "attendance"),
        where("date", ">=", fromDate),
        where("date", "<=", toDate),
        orderBy("date", "asc")
      );

      const snap = await getDocs(q);
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      alert("Error fetching attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!records.length) {
      alert("No records to export");
      return;
    }

    const cleanData = records.map(r => ({
      Date: r.date,
      Teacher: r.teacherName || r.userId,
      InTime: r.inTime || "",
      OutTime: r.outTime || "",
      Status: r.status || "",
      LateReason: r.lateReason || "",
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${fromDate}_to_${toDate}.xlsx`);
  };

  const exportPDF = () => {
    if (!records.length) {
      alert("No records to export");
      return;
    }

    const doc = new jsPDF();
    const tableData = records.map(r => [
      r.date,
      r.teacherName || r.userId,
      r.inTime || "",
      r.outTime || "",
      r.status || "",
      r.lateReason || "",
    ]);

    doc.autoTable({
      head: [["Date", "Teacher", "In Time", "Out Time", "Status", "Late Reason"]],
      body: tableData,
    });

    doc.save(`attendance_${fromDate}_to_${toDate}.pdf`);
  };

  return (
    <div style={{ maxWidth: 900, margin: "30px auto" }}>
      <h2>Export Attendance</h2>

      <div style={{ marginBottom: 15 }}>
        <label>
          From:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>{" "}
        <label>
          To:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>{" "}
        <button onClick={loadAttendance} disabled={loading}>
          {loading ? "Loading..." : "Load Records"}
        </button>
      </div>

      {records.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <button onClick={exportExcel}>Export Excel</button>{" "}
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      )}

      {records.length > 0 ? (
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
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
                <td>{r.inTime || "-"}</td>
                <td>{r.outTime || "-"}</td>
                <td>{r.status || "-"}</td>
                <td>{r.lateReason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No records found for selected dates.</p>
      )}
    </div>
  );
}
