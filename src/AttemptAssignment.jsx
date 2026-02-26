import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Assignment.css";

export default function AttemptAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const assignments =
    JSON.parse(localStorage.getItem("assignments")) || [];

  const assignment = assignments.find(
    a => a.id === Number(id)
  );

  const user =
    JSON.parse(localStorage.getItem("currentUser"));

  const [answers, setAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [fileAnswer, setFileAnswer] = useState(null);
  const [deadlineLeft, setDeadlineLeft] = useState("");
  const [mcqTimeLeft, setMcqTimeLeft] = useState(null);

  /* ================= VALIDATION ================= */

  if (!assignment) {
    return <h2>Assignment Not Found</h2>;
  }

  const existingSubmission = assignment.submissions.find(
    s => s.studentName === user.name
  );

  const isDeadlinePassed =
    new Date() > new Date(assignment.deadline);

  /* Block if deadline crossed */
  if (isDeadlinePassed && !existingSubmission) {
    return (
      <div className="assignment-card">
        <h2>⛔ Deadline Passed</h2>
        <p>This assignment is closed.</p>
        <button onClick={() => navigate("/student")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  /* Block re-attempt */
  if (existingSubmission) {
    return (
      <div className="assignment-card">
        <h2>Submission Review</h2>
        <p><strong>Submitted At:</strong> {existingSubmission.submittedAt}</p>
        <p><strong>Grade:</strong> {existingSubmission.grade || "Not Graded"}</p>
        <p><strong>Remarks:</strong> {existingSubmission.remarks || "None"}</p>

        {assignment.type === "TEXT" && (
          <p><strong>Your Answer:</strong> {existingSubmission.answers}</p>
        )}

        {assignment.type === "MCQ" && (
          <div>
            {assignment.questions.map((q, i) => (
              <p key={i}>
                Q{i + 1}: {existingSubmission.answers[i]}
              </p>
            ))}
          </div>
        )}

        {assignment.type === "FILE" && (
          <button
            onClick={() => {
              const base64Data =
                existingSubmission.answers.split(",")[1];

              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);

              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] =
                  byteCharacters.charCodeAt(i);
              }

              const byteArray =
                new Uint8Array(byteNumbers);

              const blob = new Blob([byteArray], {
                type: "application/pdf"
              });

              const fileURL =
                URL.createObjectURL(blob);

              window.open(fileURL, "_blank");
            }}
          >
            View Uploaded PDF
          </button>
        )}
      </div>
    );
  }

  /* ================= DEADLINE COUNTDOWN ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(assignment.deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setDeadlineLeft("Deadline Passed");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(
          (diff / (1000 * 60)) % 60
        );
        const seconds = Math.floor(
          (diff / 1000) % 60
        );

        setDeadlineLeft(
          `${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ================= MCQ TIMER ================= */

  useEffect(() => {
    if (assignment.type === "MCQ") {
      setMcqTimeLeft(assignment.duration * 60);
    }
  }, []);

  useEffect(() => {
    if (mcqTimeLeft === null) return;

    if (mcqTimeLeft <= 0) {
      submit();
      return;
    }

    const timer = setInterval(() => {
      setMcqTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mcqTimeLeft]);

  /* ================= SUBMIT ================= */

  const submit = () => {
    let finalAnswer = "";
    let grade = "";

    if (assignment.type === "TEXT") {
      finalAnswer = textAnswer;
    }

    if (assignment.type === "MCQ") {
      finalAnswer = answers;

      let totalScore = 0;

      assignment.questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          totalScore += Number(q.marks);
        }
      });

      grade = totalScore;
    }

    if (assignment.type === "FILE") {
      finalAnswer = fileAnswer;
    }

    const newSubmission = {
      id: Date.now(),
      studentName: user.name,
      answers: finalAnswer,
     submittedAt: new Date().toISOString(),
      grade,
      remarks: ""
    };

    const updatedAssignments = assignments.map(a => {
      if (a.id === assignment.id) {
        return {
          ...a,
          submissions: [...a.submissions, newSubmission]
        };
      }
      return a;
    });

    localStorage.setItem(
      "assignments",
      JSON.stringify(updatedAssignments)
    );

    alert("Submitted Successfully");
    navigate("/student");
  };

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-container">

      <h2>{assignment.title}</h2>

      <div className="timer">
        Deadline Countdown: {deadlineLeft}
      </div>

      {assignment.type === "MCQ" && mcqTimeLeft !== null && (
        <div className="timer">
          Test Timer: {Math.floor(mcqTimeLeft / 60)}m{" "}
          {mcqTimeLeft % 60}s
        </div>
      )}

      <div className="assignment-card">

        {assignment.type === "TEXT" && (
          <>
            <p>{assignment.description}</p>
            <textarea
              onChange={e =>
                setTextAnswer(e.target.value)
              }
            />
          </>
        )}

        {assignment.type === "MCQ" &&
          assignment.questions.map((q, i) => (
            <div key={i}>
              <p>{q.questionText}</p>

              {q.options.map((opt, idx) => (
                <div key={idx}>
                  <input
                    type="radio"
                    name={`question-${i}`}
                    value={opt}
                    onChange={e => {
                      const updated = [...answers];
                      updated[i] = e.target.value;
                      setAnswers(updated);
                    }}
                  />
                  {opt}
                </div>
              ))}
            </div>
          ))}

        {assignment.type === "FILE" && (
          <>
            <p>{assignment.description}</p>
            <input
              type="file"
              accept=".pdf"
              onChange={e => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                  setFileAnswer(reader.result);
                };
                reader.readAsDataURL(file);
              }}
            />
          </>
        )}

        <button onClick={submit}>
          Submit
        </button>

      </div>
    </div>
  );
}