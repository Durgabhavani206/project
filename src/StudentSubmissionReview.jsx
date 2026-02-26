import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Assignment.css";

export default function StudentSubmissionReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const assignments =
    JSON.parse(localStorage.getItem("assignments")) || [];

  const user =
    JSON.parse(localStorage.getItem("currentUser"));

  const assignment = assignments.find(
    a => a.id === Number(id)
  );

  if (!assignment) return <h2>No Assignment Found</h2>;

  const submission = assignment.submissions.find(
    s => s.studentName === user.name
  );

  if (!submission) return <h2>No Submission Found</h2>;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="dashboard-container">

      {/* BACK BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/student")}
          style={{
            background: "#6a1b9a",
            borderRadius: "8px",
            padding: "8px 16px"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="assignment-card">
        <h2>Submission Review</h2>

        <p>
          <strong>Submitted At:</strong>{" "}
          {formatDateTime(submission.submittedAt)}
        </p>

        <p>
          <strong>Grade:</strong>{" "}
          {submission.grade !== "" &&
          submission.grade != null
            ? submission.grade
            : "Not Graded"}
        </p>

        <p>
          <strong>Remarks:</strong>{" "}
          {submission.remarks
            ? submission.remarks
            : "None"}
        </p>

        {assignment.type === "TEXT" && (
          <p>
            <strong>Your Answer:</strong>{" "}
            {submission.answers}
          </p>
        )}

        {assignment.type === "MCQ" && (
  <>
    {(Array.isArray(submission.answers)
      ? submission.answers
      : JSON.parse(submission.answers)
    ).map((ans, i) => (
      <p key={i}>
        <strong>Q{i + 1}:</strong> {ans}
      </p>
    ))}
  </>
)}

        {assignment.type === "FILE" && (
          <button
            onClick={() => {
              const base64Data =
                submission.answers.split(",")[1];

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
            }}
          >
            View Submitted File
          </button>
        )}
      </div>
    </div>
  );
}