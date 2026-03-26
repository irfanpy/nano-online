import BackActionButton from "./BackActionButton.jsx";

export default function FormPageHeader({ title, subtitle, onBack }) {
  return (
    <div className="form-page-header">
      <BackActionButton onClick={onBack} />
      <div className="form-page-copy">
        <h2>{title}</h2>
        <p className="form-page-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
