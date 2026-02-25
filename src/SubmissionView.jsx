import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Assignment.css";

export default function SubmissionView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const assignments =
    JSON.parse(localStorage.getItem("assignments")) || [];

  const assignment = assignments.find(
    a => a.id === Number(id)
  );

  if (!assignment) {
    return <h2>No Assignment Found</h2>;
  }

  const [gradeData, setGradeData] = useState({});

  /* ================= DATE FORMAT ================= */

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

  /* ================= SAVE GRADE ================= */

  const saveGrade = (subId) => {
    const updated = assignments.map(a => {
      if (a.id === assignment.id) {
        return {
          ...a,
          submissions: a.submissions.map(s =>
            s.id === subId
              ? {
                  ...s,
                  grade:
                    gradeData[subId]?.grade ?? s.grade,
                  remarks:
                    gradeData[subId]?.remarks ?? s.remarks
                }
              : s
          )
        };
      }
      return a;
    });

    localStorage.setItem(
      "assignments",
      JSON.stringify(updated)
    );

    alert("Grade Saved Successfully");
  };

  return (
    <div className="dashboard-container">

      {/* 🔥 BACK BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/teacher")}
          style={{
            background: "#6a1b9a",
            borderRadius: "8px",
            padding: "8px 16px"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <h2>{assignment.title} - Submissions</h2>

      {assignment.submissions.length === 0 && (
        <p>No Submissions Yet</p>
      )}

      {assignment.submissions.map(s => (
        <div key={s.id} className="assignment-card">

          <p>
            <strong>Student:</strong> {s.studentName}
          </p>

          <p>
            <strong>Submitted At:</strong>{" "}
            {formatDateTime(s.submittedAt)}
          </p>

          {/* FILE VIEW */}
          {assignment.type === "FILE" && s.answers && (
            <button
              onClick={() => {
                try {
                  const base64Data =
                    s.answers.split(",")[1];

                  const byteCharacters =
                    atob(base64Data);

                  const byteNumbers =
                    new Array(byteCharacters.length);

                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] =
                      byteCharacters.charCodeAt(i);
                  }

                  const byteArray =
                    new Uint8Array(byteNumbers);

                  const blob = new Blob(
                    [byteArray],
                    { type: "application/pdf" }
                  );

                  const fileURL =
                    URL.createObjectURL(blob);

                  window.open(fileURL, "_blank");
                } catch (error) {
                  alert("Unable to open PDF.");
                }
              }}
            >
              View Uploaded PDF
            </button>
          )}

          {/* TEXT */}
          {assignment.type === "TEXT" && (
            <p>
              <strong>Answer:</strong> {s.answers}
            </p>
          )}

          {/* MCQ */}
          {assignment.type === "MCQ" &&
            JSON.parse(s.answers).map((ans, i) => (
              <p key={i}>
                Q{i + 1}: {ans}
              </p>
            ))}

          <input
            type="number"
            placeholder="Enter Grade"
            defaultValue={s.grade}
            onChange={e =>
              setGradeData({
                ...gradeData,
                [s.id]: {
                  ...gradeData[s.id],
                  grade: e.target.value
                }
              })
            }
          />

          <input
            placeholder="Enter Remarks"
            defaultValue={s.remarks}
            onChange={e =>
              setGradeData({
                ...gradeData,
                [s.id]: {
                  ...gradeData[s.id],
                  remarks: e.target.value
                }
              })
            }
          />

          <button onClick={() => saveGrade(s.id)}>
            Save Grade
          </button>

        </div>
      ))}
    </div>
  );
}