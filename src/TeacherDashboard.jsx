import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Assignment.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [questionFile, setQuestionFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "TEXT",
    deadline: "",
    duration: 1,
    totalMarks: 100,
    questions: []
  });

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("assignments")) || [];

    const updated = stored.map(a => {
      if (
        a.status !== "CLOSED" &&
        new Date() > new Date(a.deadline)
      ) {
        return { ...a, status: "CLOSED" };
      }
      return a;
    });

    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
  }, []);

  const users =
    JSON.parse(localStorage.getItem("users")) || [];
  const students = users.filter(u => u.role === "Student");

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          marks: 1
        }
      ]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...form.questions];
    updated[index][field] = value;
    setForm({ ...form, questions: updated });
  };

  const deleteAssignment = (id) => {
    const assignment = assignments.find(a => a.id === id);

    if (assignment.submissions.length > 0) {
      alert("Cannot delete. Students already submitted.");
      return;
    }

    if (!window.confirm("Delete this assignment?")) return;

    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
  };

  const handleSubmit = () => {
    if (!form.title || !form.deadline) {
      alert("Fill required fields");
      return;
    }

    if (editingAssignment) {
      const updatedAssignments = assignments.map(a => {
        if (a.id === editingAssignment.id) {
          return {
            ...a,
            ...form,
            questionFile,
            versions: [
              ...a.versions,
              {
                version: a.versions.length + 1,
                updatedAt: new Date().toISOString()
              }
            ]
          };
        }
        return a;
      });

      setAssignments(updatedAssignments);
      localStorage.setItem(
        "assignments",
        JSON.stringify(updatedAssignments)
      );

      alert("Updated Successfully");
      setEditingAssignment(null);
      setActiveTab("all");
    } else {
      const newAssignment = {
        id: Date.now(),
        ...form,
        questionFile,
        status: "ACTIVE",
        versions: [
          {
            version: 1,
            updatedAt: new Date().toISOString()
          }
        ],
        submissions: []
      };

      const updated = [...assignments, newAssignment];
      setAssignments(updated);
      localStorage.setItem("assignments", JSON.stringify(updated));

      alert("Created Successfully");
      setActiveTab("all");
    }

    setForm({
      title: "",
      description: "",
      type: "TEXT",
      deadline: "",
      duration: 1,
      totalMarks: 100,
      questions: []
    });

    setQuestionFile(null);
  };

  const getFilteredAssignments = () => {
    if (activeTab === "all") return assignments;
    if (activeTab === "graded")
      return assignments.filter(a =>
        a.submissions.some(s => s.grade)
      );
    if (activeTab === "ungraded")
      return assignments.filter(a =>
        a.submissions.some(s => !s.grade)
      );
    if (activeTab === "pending")
      return assignments.filter(a =>
        a.submissions.length < students.length
      );
    return assignments;
  };

  return (
    <div className="dashboard-container">

      <div className="logout-container">
        <img
          src="logout.png"
          className="logout-icon"
          onClick={logout}
          alt="Logout"
        />
      </div>

      <h1>🧑‍🏫 Teacher Dashboard</h1>

      <div className="teacher-navbar">
        {["create", "all", "graded", "ungraded", "pending"].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? "active-tab" : ""}
            onClick={() => {
              setActiveTab(tab);
              setEditingAssignment(null);
            }}
          >
            {tab === "create"
              ? "Create Assignment"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* CREATE SECTION */}
      {activeTab === "create" && (
        <div className="assignment-card">
          <h3>
            {editingAssignment ? "Edit Assignment" : "Create Assignment"}
          </h3>

          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="TEXT">Text</option>
            <option value="MCQ">MCQ</option>
            <option value="FILE">File</option>
          </select>

          {/* MCQ */}
          {form.type === "MCQ" && (
            <>
              <input
                type="number"
                name="duration"
                placeholder="Duration (minutes)"
                value={form.duration}
                onChange={handleChange}
              />

              <button onClick={addQuestion}>Add Question</button>

              {form.questions.map((q, i) => (
                <div key={i} className="assignment-card">
                  <input
                    placeholder="Question"
                    value={q.questionText}
                    onChange={e =>
                      handleQuestionChange(i, "questionText", e.target.value)
                    }
                  />

                  {q.options.map((opt, idx) => (
                    <input
                      key={idx}
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={e => {
                        const updated = [...form.questions];
                        updated[i].options[idx] = e.target.value;
                        setForm({ ...form, questions: updated });
                      }}
                    />
                  ))}

                  <input
                    placeholder="Correct Answer"
                    value={q.correctAnswer}
                    onChange={e =>
                      handleQuestionChange(i, "correctAnswer", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    placeholder="Marks"
                    value={q.marks}
                    onChange={e =>
                      handleQuestionChange(i, "marks", e.target.value)
                    }
                  />
                </div>
              ))}
            </>
          )}

          {/* FILE */}
          {form.type === "FILE" && (
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setQuestionFile(reader.result);
                };
                reader.readAsDataURL(file);
              }}
            />
          )}

          <button onClick={handleSubmit}>
            {editingAssignment ? "Save Changes" : "Create"}
          </button>
        </div>
      )}

      {/* ======== ANALYTICS ADDED (ONLY THIS BLOCK NEW) ======== */}
      {activeTab === "all" && assignments.length > 0 && (
        <div className="assignment-card">
          <h3>Analytics Overview</h3>
          <p>Total Assignments: {assignments.length}</p>
          <p>
            Active Assignments:{" "}
            {assignments.filter(a => a.status === "ACTIVE").length}
          </p>
          <p>
            Closed Assignments:{" "}
            {assignments.filter(a => a.status === "CLOSED").length}
          </p>
          <p>
            Total Submissions:{" "}
            {assignments.reduce(
              (sum, a) => sum + a.submissions.length,
              0
            )}
          </p>
        </div>
      )}

      {/* ASSIGNMENT LIST */}
      {activeTab !== "create" &&
        getFilteredAssignments().map(a => {
          const submitted = a.submissions.length;
          const percentage =
            students.length > 0
              ? (submitted / students.length) * 100
              : 0;

          return (
            <div key={a.id} className="assignment-card">
              <h3>{a.title}</h3>
              <p>Status: {a.status}</p>
              <p>Deadline: {new Date(a.deadline).toLocaleString()}</p>
              <p>Submitted: {submitted}</p>
              <p>Pending: {students.length - submitted}</p>

              <div style={{
                width: "100%",
                height: "10px",
                background: "#eee",
                borderRadius: "10px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: "#6a1b9a"
                }} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => navigate(`/teacher/${a.id}`)}>
                  View Submissions
                </button>

                <button
                  disabled={
                    a.submissions.length > 0 ||
                    a.status === "CLOSED"
                  }
                  onClick={() => {
                    setEditingAssignment(a);
                    setForm({
                      title: a.title,
                      description: a.description,
                      type: a.type,
                      deadline: a.deadline,
                      duration: a.duration,
                      totalMarks: a.totalMarks,
                      questions: a.questions || []
                    });
                    setQuestionFile(a.questionFile);
                    setActiveTab("create");
                  }}
                >
                  Edit
                </button>

                <button onClick={() => deleteAssignment(a.id)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}