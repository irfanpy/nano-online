import Icon from "./Icon.jsx";

export default function BackActionButton({ onClick, label = "Back" }) {
  return (
    <button type="button" className="secondary page-back-button" onClick={onClick}>
      <span className="action-button-icon subtle">
        <Icon name="arrow-left" size={15} />
      </span>
      <span>{label}</span>
    </button>
  );
}
