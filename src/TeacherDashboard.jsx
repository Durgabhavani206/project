import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./Assignment.css";

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState("Text");
  const [totalMarks, setTotalMarks] = useState(100);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("assignments")) || [];
    setAssignments(stored);
  }, []);

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const logout = () => {
    localStorage.removeItem("currentUser");
    setRedirectToLogin(true);
  };

  const createAssignment = () => {
    if (!title || !deadline) {
      alert("Fill all required fields");
      return;
    }

    const newAssignment = {
      id: Date.now(),
      title,
      description,
      deadline,
      type,
      totalMarks,
      questions:
        type === "MCQ"
          ? [
              {
                question: "Sample Question?",
                options: ["Option A", "Option B", "Option C"],
                correctAnswer: "Option A",
              },
            ]
          : [],
      submissions: [],
    };

    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));

    setTitle("");
    setDescription("");
    setDeadline("");
    setTotalMarks(100);
  };

  const gradeSubmission = (assignmentId, submissionId, grade, feedback) => {
    const updated = assignments.map((a) => {
      if (a.id === assignmentId) {
        return {
          ...a,
          submissions: a.submissions.map((s) =>
            s.id === submissionId ? { ...s, grade, feedback } : s
          ),
        };
      }
      return a;
    });

    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
  };

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard-container">
      {/* Logout Button with Icon */}
      <div className="logout-container">
        <img
          src="/logout.png"
          alt="Logout"
          className="logout-icon"
          onClick={logout}
        />
      </div>

      <h1>👩‍🏫 Teacher Dashboard</h1>

      <div className="assignment-card">
        <h3>Create Assignment</h3>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Text">Text</option>
          <option value="MCQ">MCQ</option>
          <option value="File">File Upload</option>
        </select>

        <input
          type="number"
          placeholder="Total Marks"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
        />

        <button onClick={createAssignment}>Create</button>
      </div>

      {assignments.map((a) => (
        <div key={a.id} className="assignment-card">
          <h3>{a.title}</h3>
          <p><strong>Type:</strong> {a.type}</p>
          <p><strong>Deadline:</strong> {a.deadline}</p>
          <p><strong>Submissions:</strong> {a.submissions.length}</p>

          <h4>Student Submissions</h4>
          {a.submissions.map((s) => (
            <div key={s.id} className="submission-box">
              <p><strong>Student:</strong> {s.student}</p>
              <p><strong>Content:</strong> {s.content}</p>
              <p><strong>Grade:</strong> {s.grade || "Pending"}</p>

              {a.type !== "MCQ" && (
                <>
                  <input
                    type="text"
                    placeholder="Enter Grade"
                    onBlur={(e) =>
                      gradeSubmission(a.id, s.id, e.target.value, s.feedback)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Enter Feedback"
                    onBlur={(e) =>
                      gradeSubmission(a.id, s.id, s.grade, e.target.value)
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}