type Props = {
  text: string;
};

function colorOf(text: string): string {
  const t = text.toUpperCase();
  if (["APPROVED", "PASS", "READY", "ACKED", "RECEIVED", "OK"].includes(t)) return "#166534";
  if (["FAILED", "FAIL", "BLOCKED", "MISMATCH", "REJECTED"].includes(t)) return "#991b1b";
  if (["PENDING", "PROCESSING", "QUEUED", "WAITING", "INGEST"].includes(t)) return "#1d4ed8";
  return "#374151";
}

export default function StatusBadge({ text }: Props) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "#f3f4f6", color: colorOf(text), border: "1px solid #e5e7eb", fontSize: 12 }}>
      {text}
    </span>
  );
}
