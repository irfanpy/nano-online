import Icon from "./Icon.jsx";

export default function SubmitActionButton({ isEdit, createLabel, updateLabel }) {
  return (
    <button type="submit" className="action-button submit-button">
      <span className="action-button-icon">
        <Icon name={isEdit ? "check" : "save"} size={16} />
      </span>
      <span>{isEdit ? updateLabel : createLabel}</span>
    </button>
  );
}
