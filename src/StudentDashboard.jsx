import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./Assignment.css";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [content, setContent] = useState("");
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("assignments")) || [];
    setAssignments(stored);
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUser");
    setRedirectToLogin(true);
  };

  const submitAssignment = (assignmentId, assignment) => {
    if (!content) {
      alert("Write something before submitting");
      return;
    }

    let grade = "";
    if (assignment.type === "MCQ") {
      grade = content === assignment.questions[0].correctAnswer ? "100" : "0";
    }

    const updated = assignments.map((a) => {
      if (a.id === assignmentId) {
        return {
          ...a,
          submissions: [
            ...a.submissions,
            {
              id: Date.now(),
              student: currentUser.name,
              content,
              grade,
              feedback: "",
            },
          ],
        };
      }
      return a;
    });

    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
    setContent("");
  };

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

  const pending = assignments.filter(
    (a) =>
      !a.submissions.some((s) => s.student === currentUser.name)
  );

  const completed = assignments.filter((a) =>
    a.submissions.some((s) => s.student === currentUser.name)
  );

  return (
    <div className="dashboard-container">
      <div className="logout-container">
        <img
          src="logout.png"
          alt="Logout"
          className="logout-icon"
          onClick={logout}
        />
      </div>

      <h1>🎓 Student Dashboard</h1>

      <h2>Pending Assignments</h2>
      {pending.map((a) => (
        <div key={a.id} className="assignment-card">
          <h3>{a.title}</h3>
          <p><strong>Type:</strong> {a.type}</p>
          <p><strong>Deadline:</strong> {a.deadline}</p>

          {a.type === "Text" && (
            <textarea
              placeholder="Write your answer..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}

          {a.type === "File" && (
            <input
              type="text"
              placeholder="Enter file name (demo)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}

          {a.type === "MCQ" &&
            a.questions.map((q, i) => (
              <div key={i}>
                <p>{q.question}</p>
                {q.options.map((opt, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name={`q${i}`}
                      value={opt}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}

          <button onClick={() => submitAssignment(a.id, a)}>
            Submit
          </button>
        </div>
      ))}

      <h2>Completed Assignments</h2>
      {completed.map((a) => (
        <div key={a.id} className="assignment-card">
          <h3>{a.title}</h3>
          {a.submissions
            .filter((s) => s.student === currentUser.name)
            .map((s) => (
              <div key={s.id}>
                <p><strong>Grade:</strong> {s.grade || "Pending"}</p>
                <p><strong>Feedback:</strong> {s.feedback || "None"}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}