// v0 Preview Compatibility Layer
// This is a Vite + React app, not Next.js
// The actual app runs at src/main.tsx

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          borderRadius: "1rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "600px",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          SageSpace
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>Vite + React Application</p>
        <div
          style={{
            background: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>🚀 Development Server:</h2>
          <code style={{ color: "#667eea" }}>npm run dev</code>
          <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
            Runs on <strong>http://localhost:5173</strong>
          </p>
        </div>
        <div
          style={{
            background: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            textAlign: "left",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>📁 App Structure:</h2>
          <ul style={{ fontSize: "0.9rem", color: "#666", listStyle: "none", padding: 0 }}>
            <li>
              • <strong>Entry:</strong> src/main.tsx
            </li>
            <li>
              • <strong>Root:</strong> src/App.tsx
            </li>
            <li>
              • <strong>Routing:</strong> React Router
            </li>
            <li>
              • <strong>Build:</strong> Vite
            </li>
          </ul>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#999", marginTop: "2rem" }}>
          Note: This file exists for v0 preview compatibility
        </p>
      </div>
    </div>
  )
}
