import { useState } from "react";

export default function TeacherAssignmentForm({ addAssignment }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [duration, setDuration] = useState(1);
  const [questions, setQuestions] = useState([""]);

  const create = () => {
    const newAssignment = {
      id: Date.now(),
      title,
      type,
      duration,
      questions,
      submissions: [],
    };

    addAssignment(newAssignment);
    setTitle("");
    alert("Assignment Created");
  };

  return (
    <div className="assignment-card">
      <h3>Create Assignment</h3>

      <input
        placeholder="Assignment Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="text">Text</option>
        <option value="file">File Upload</option>
        <option value="mcq">MCQ Exam</option>
      </select>

      {type === "mcq" && (
        <>
          <input
            type="number"
            placeholder="Duration (minutes)"
            onChange={(e) => setDuration(e.target.value)}
          />

          {questions.map((q, i) => (
            <input
              key={i}
              placeholder={"Question " + (i + 1)}
              onChange={(e) => {
                const arr = [...questions];
                arr[i] = e.target.value;
                setQuestions(arr);
              }}
            />
          ))}

          <button onClick={() => setQuestions([...questions, ""])}>
            Add Question
          </button>
        </>
      )}

      <button onClick={create}>Create</button>
    </div>
  );
}