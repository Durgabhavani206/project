import "./FileUploadBox.css";

export default function FileUploadBox() {
  return (
    <div className="upload-card">
      <input type="file" />
      <p>Drag & Upload File</p>
    </div>
  );
}