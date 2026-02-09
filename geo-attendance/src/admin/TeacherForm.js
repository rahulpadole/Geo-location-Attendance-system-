import { useState, useEffect } from "react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams, useNavigate } from "react-router-dom";

export default function TeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // Load teacher data if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      getDoc(doc(db, "users", id))
        .then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setName(data.name || "");
            setDepartment(data.department || "");
          } else {
            alert("Teacher not found");
            navigate("/admin/teachers");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Error fetching teacher data: " + err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  // Save or update teacher
  const save = async () => {
    if (!name || !department) {
      return alert("Please fill in all fields");
    }

    setLoading(true);
    try {
      if (id) {
        // Update existing teacher
        await updateDoc(doc(db, "users", id), { name, department });
        alert("✅ Teacher updated successfully");
      } else {
        // Add new teacher
        await addDoc(collection(db, "users"), {
          name,
          department,
          role: "teacher",
          active: true,
        });
        alert("✅ Teacher added successfully");
      }
      navigate("/admin/teachers");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving teacher: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>{id ? "Edit" : "Add"} Teacher</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Name:</label>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Department:</label>
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
        />
      </div>

      <button
        onClick={save}
        disabled={loading}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {loading ? (id ? "Updating..." : "Saving...") : "Save"}
      </button>
    </div>
  );
}
