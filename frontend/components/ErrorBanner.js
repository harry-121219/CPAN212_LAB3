export default function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">Error: {message}</div>;
}
