import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    fetch("http://localhost:8000/view-invoices")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch invoices");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // 🔥 FIXED HANDLE UPLOAD
  const handleUpload = async () => {
    const file = document.getElementById("fileInput").files[0];

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/full-process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong ❌");
        setLoading(false);
        return;
      }

      toast.success("Invoice processed successfully 🚀");
      fetchInvoices();

    } catch {
      toast.error("Server error ❌");
    }

    setLoading(false);
  };

  const approveInvoice = async (id) => {
    try {
      await fetch(`http://localhost:8000/approve/${id}`, {
        method: "PUT",
      });

      toast.success("Invoice approved ✅");
      fetchInvoices();
    } catch {
      toast.error("Approval failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

      <Toaster position="top-right" />

      <motion.div
        className="p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Invoice Intelligence</h1>
            <p className="text-gray-400 text-sm">
              AI-powered financial automation
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="file"
              id="fileInput"
              className="text-sm text-gray-300 file:bg-white/10 file:border-0 file:px-3 file:py-1 file:rounded file:text-white"
            />

            <button
              onClick={handleUpload}
              className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 hover:scale-105 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Analyzing Invoice...
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>

        {/* AI INSIGHT */}
        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl mb-6 backdrop-blur">
          <p className="text-purple-300 font-medium">
            🤖 AI Insight: {
              invoices.length === 0
                ? "No data available yet."
                : invoices.length > 5
                ? "Spike detected in invoice activity 🚨"
                : invoices.some(i => i.status !== "Auto Approved")
                ? "Some invoices need manual review."
                : "All invoices are auto-approved efficiently ✅"
            }
          </p>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur">

          <table className="w-full text-left">

            <thead className="bg-white/10 text-gray-300 text-sm">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-t border-white/10 animate-pulse">
                    <td className="p-4"><div className="h-4 bg-white/10 w-24 rounded"></div></td>
                    <td className="p-4"><div className="h-4 bg-white/10 w-20 rounded"></div></td>
                    <td className="p-4"><div className="h-4 bg-white/10 w-16 rounded"></div></td>
                    <td className="p-4"><div className="h-4 bg-white/10 w-24 rounded"></div></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400">
                    📂 No invoices yet. Upload one to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-white/10 hover:bg-white/10 transition"
                  >

                    <td className="p-4 font-medium">
                      #{inv.invoice_number}
                    </td>

                    <td className="p-4 text-gray-400">
                      {inv.date}
                    </td>

                    <td className="p-4 font-semibold">
                      ₹{inv.amount}
                    </td>

                    <td className="p-4">

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        inv.status === "Auto Approved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {inv.status}
                      </span>

                      {inv.status !== "Auto Approved" && (
                        <button
                          onClick={() => approveInvoice(inv.id)}
                          className="ml-3 text-xs bg-purple-600 px-3 py-1 rounded-md hover:bg-purple-700 transition"
                        >
                          Approve
                        </button>
                      )}

                      {inv.fraud_flags && inv.fraud_flags.length > 0 && (
                        <div className="mt-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/20 p-2 rounded">
                          ⚠️ {inv.fraud_flags.join(", ")}
                        </div>
                      )}

                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </motion.div>
    </div>
  );
}

export default Dashboard;