"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 1rem"
      }}
    >
      <h1 style={{ fontSize: "6rem", margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.5rem", margin: "1rem 0" }}>
        Sorry, the page you are looking for does not exist.
      </p>
      <button
        onClick={() => router.push("/")}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: "pointer",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          transition: "background-color 0.3s ease"
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#005bb5")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#0070f3")
        }
      >
        Go Home
      </button>
    </div>
  );
}
