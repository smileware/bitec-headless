export default function Loading() {
  return (
    <div aria-label="Loading" role="status">
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: 'linear-gradient(90deg, #CE0E2D 0%, #FF6B81 50%, #CE0E2D 100%)',
          backgroundSize: '200% 100%',
          animation: 'bitecTopBar 1.2s ease-in-out infinite',
          zIndex: 9999,
        }}
      />
      <style>{`
        @keyframes bitecTopBar {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}


