/**
 * Renders animated typing indicator bubbles to simulate active bot response.
 * @returns {JSX.Element} The SVG dot animation structure.
 */
export default function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1.25 px-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-pf-editorial-accent fw-dot"
        />
      ))}
    </div>
  );
}
