export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      fontFamily: "system-ui, sans-serif",
      color: "var(--fg-muted, #888)",
      fontSize: "16px",
      gap: "10px",
    }}>
      <span style={{ fontSize: "20px" }}>⏳</span>
      Sózlik júklenip atır...
    </div>
  );
}