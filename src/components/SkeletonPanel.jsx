export default function SkeletonPanel() {
  return (
    <div className="skeleton-grid" aria-label="Carregando dados em tempo real">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <strong />
          <i />
        </div>
      ))}
    </div>
  );
}
