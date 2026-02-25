import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Assignment.css";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("assignments")) || [];
    setAssignments(stored);
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  /* ================= DATE FORMAT FUNCTION ================= */

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date)) return dateString;

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  /* ================= PERFORMANCE ANALYTICS ================= */

  const mySubmissions = assignments.flatMap(a =>
    a.submissions.filter(s => s.studentName === user.name)
  );

  const grades = mySubmissions
    .map(s => Number(s.grade))
    .filter(g => !isNaN(g));

  const average =
    grades.length > 0
      ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)
      : 0;

  const highest = grades.length > 0 ? Math.max(...grades) : 0;
  const lowest = grades.length > 0 ? Math.min(...grades) : 0;

  /* ================= DEADLINE REMINDER SYSTEM ================= */

  const now = new Date().getTime();

  const upcomingDeadlines = assignments
    .map(a => {
      const submission = a.submissions.find(
        s => s.studentName === user.name
      );

      if (submission) return null;

      const deadlineTime = new Date(a.deadline).getTime();
      const hoursLeft = (deadlineTime - now) / (1000 * 60 * 60);

      if (hoursLeft > 0 && hoursLeft <= 24) {
        return {
          ...a,
          hoursLeft: hoursLeft
        };
      }

      return null;
    })
    .filter(Boolean);

  /* ================= UI ================= */

  return (
    <div className="dashboard-container">

      {/* Logout */}
      <div className="logout-container">
        <img
          src="logout.png"
          alt="Logout"
          className="logout-icon"
          onClick={logout}
        />
      </div>

      <h1>🎓 Student Dashboard</h1>

      {/* 🔔 DEADLINE ALERT */}
      {upcomingDeadlines.length > 0 && (
        <div
          style={{
            background: "#fff3cd",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: "1px solid #ffeeba"
          }}
        >
          <strong>⚠ Upcoming Deadlines</strong>

          {upcomingDeadlines.map(a => (
            <p
              key={a.id}
              style={{
                color: a.hoursLeft <= 3 ? "red" : "black",
                fontWeight: a.hoursLeft <= 3 ? "bold" : "normal"
              }}
            >
              "{a.title}" due on {formatDateTime(a.deadline)} 
              ({Math.floor(a.hoursLeft)} hrs left)
            </p>
          ))}
        </div>
      )}

      {/* Profile */}
      <div className="assignment-card profile-box">
        <img src="profile.png" alt="Profile" width="80" />
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </div>

      {/* Analytics */}
      <div className="assignment-card">
        <h3>Performance Analytics</h3>
        <p>Total Attempts: {grades.length}</p>
        <p>Average Score: {average}</p>
        <p>Highest Score: {highest}</p>
        <p>Lowest Score: {lowest}</p>
      </div>

      {/* Assignments Table */}
      <div className="assignment-card">
        <h2>Assignments</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {assignments.map(a => {
              const submission = a.submissions.find(
                s => s.studentName === user.name
              );

              const status = submission
                ? submission.grade !== "" && submission.grade != null
                  ? "Graded"
                  : "Submitted"
                : "Pending";

              const urgent = upcomingDeadlines.find(d => d.id === a.id);

              return (
                <tr
                  key={a.id}
                  style={{
                    background:
                      urgent && urgent.hoursLeft <= 3
                        ? "#ffe6e6"
                        : "transparent"
                  }}
                >
                  <td>{a.title}</td>
                  <td>{a.type}</td>

                  <td>{formatDateTime(a.deadline)}</td>

                  <td>
                    <span className={`status-badge status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>

                  <td>
                    {submission && submission.grade !== "" && submission.grade != null
                      ? submission.grade
                      : "-"}
                  </td>

                  <td>
                    {submission
                      ? formatDateTime(submission.submittedAt)
                      : "-"}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        submission
                          ? navigate(`/review/${a.id}`)
                          : navigate(`/attempt/${a.id}`)
                      }
                    >
                      {submission ? "View" : "Start"}
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}