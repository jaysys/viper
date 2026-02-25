"use client";

import { useState } from "react";

type Props = {
  src?: string;
  fullUrl?: string;
  alt: string;
  captureMode?: string;
  sensorType?: string;
  acquiredAt?: string;
};

const FALLBACK = "/mock-images/satellite-fallback.svg";

function formatAcquiredAt(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().replace("T", " ").slice(0, 16) + "Z";
}

export default function CaptureThumbnail({ src, fullUrl, alt, captureMode, sensorType, acquiredAt }: Props) {
  const [current, setCurrent] = useState(src || FALLBACK);
  const [failed, setFailed] = useState(!src);
  const [open, setOpen] = useState(false);
  const overlay = [captureMode, sensorType, formatAcquiredAt(acquiredAt)].filter(Boolean).join(" | ");
  const imageEl = (
    <div style={{ position: "relative", width: 96, height: 64 }}>
      <img
        src={current}
        alt={alt}
        width={96}
        height={64}
        style={{
          objectFit: "cover",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          cursor: "pointer",
        }}
        onError={() => {
          setFailed(true);
          setCurrent(FALLBACK);
        }}
      />
      {overlay ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.66)",
            color: "#f9fafb",
            fontSize: 8,
            lineHeight: 1.3,
            padding: "2px 3px",
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={overlay}
        >
          {overlay}
        </div>
      ) : null}
    </div>
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ padding: 0, border: 0, background: "transparent" }}
        aria-label={`${alt} 확대 보기`}
      >
        {imageEl}
      </button>
      {fullUrl && !failed ? (
        <div>
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            원본
          </a>
        </div>
      ) : null}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 8, padding: 12, maxWidth: "90vw", maxHeight: "90vh" }}
          >
            <img
              src={current}
              alt={alt}
              style={{ maxWidth: "80vw", maxHeight: "75vh", display: "block", borderRadius: 6 }}
            />
            {overlay ? <div style={{ marginTop: 8, fontSize: 12, color: "#111827" }}>{overlay}</div> : null}
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 12 }}>
              {fullUrl && !failed ? (
                <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                  원본 새 탭
                </a>
              ) : (
                <span style={{ color: "#6b7280" }}>외부 원본 링크 없음</span>
              )}
              <button type="button" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
