import Icon from "./Icon.jsx";

export default function AddActionButton({ label, onClick }) {
  return (
    <button type="button" className="action-button add-button" onClick={onClick}>
      <span className="action-button-icon">
        <Icon name="plus" size={16} />
      </span>
      <span>{label}</span>
    </button>
  );
}
