export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="fs-logo" aria-label="Floral Sports logo">
        <span className="fs-logo-f">F</span>
        <span className="fs-logo-s">S</span>
      </div>

      <div className="loading-subtitle">Floral Gang Presents</div>
      <div className="loading-title">FLORAL SPORTS</div>

      <div className="loading-indicator" aria-hidden="true">
        <div className="loading-indicator-bar" />
      </div>
    </div>
  );
}