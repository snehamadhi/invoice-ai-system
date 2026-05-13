import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import toast from "react-hot-toast";

function App() {
  const [page, setPage] = useState("dashboard");

  // 🔥 RESET FUNCTION
  const handleReset = async () => {
    try {
      await fetch("http://localhost:8000/reset");
      toast.success("System reset successfully 🧹");
      window.location.reload(); // refresh UI
    } catch {
      toast.error("Reset failed ❌");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-10">🚀 AI Finance</h2>

        <nav className="space-y-4 text-gray-400">

          <p
            onClick={() => setPage("dashboard")}
            className={`cursor-pointer ${
              page === "dashboard"
                ? "text-purple-400"
                : "hover:text-white"
            }`}
          >
            Dashboard
          </p>

          <p
            onClick={() => setPage("invoices")}
            className={`cursor-pointer ${
              page === "invoices"
                ? "text-purple-400"
                : "hover:text-white"
            }`}
          >
            Invoices
          </p>

          <p
            onClick={() => setPage("analytics")}
            className={`cursor-pointer ${
              page === "analytics"
                ? "text-purple-400"
                : "hover:text-white"
            }`}
          >
            Analytics
          </p>

          {/* 🔥 RESET BUTTON */}
          <button
            onClick={handleReset}
            className="mt-10 w-full bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg hover:bg-red-500/30 transition"
          >
            Reset System 🧹
          </button>

        </nav>
      </div>

      {/* PAGE CONTENT */}
      <div className="flex-1">
        {page === "dashboard" && <Dashboard />}
        {page === "invoices" && <Invoices />}
        {page === "analytics" && <Analytics />}
      </div>

    </div>
  );
}

export default App;