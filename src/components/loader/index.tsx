"use client";

export default function Loader({ margin = 20 }: { margin?: number }) {
  return (
    <div
      style={{
        width: "100%",
        marginTop: `${margin}vh`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoaderIcon />
    </div>
  );
}

export function LoaderIcon() {
  return (
    <svg className="h-8 w-8 animate-spin text-sky-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z" />
    </svg>
  );
}
