import { useEffect, useState } from "react";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:8000/view-invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.data || []));
  }, []);

  // 🔍 SEARCH + FILTER LOGIC
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all"
        ? true
        : filter === "approved"
        ? inv.status === "Auto Approved"
        : filter === "pending"
        ? inv.status !== "Auto Approved"
        : filter === "fraud"
        ? inv.fraud_flags && inv.fraud_flags.length > 0
        : true;

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-10 text-white">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📄 Invoices</h1>
        <p className="text-gray-400 text-sm">
          Manage and review all invoices
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* 🔥 CUSTOM DROPDOWN */}
        <div className="relative w-44">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/10 text-white px-4 py-2 pr-10 rounded-lg text-sm outline-none backdrop-blur transition hover:border-purple-400 focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-gray-900 text-white">
              All
            </option>
            <option value="approved" className="bg-gray-900 text-white">
              Approved
            </option>
            <option value="pending" className="bg-gray-900 text-white">
              Pending
            </option>
            <option value="fraud" className="bg-gray-900 text-white">
              Fraud
            </option>
          </select>

          {/* Custom Arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>

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
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  No matching invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
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

                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        inv.status === "Auto Approved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {inv.status}
                    </span>

                    {/* FRAUD ALERT */}
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

    </div>
  );
}

export default Invoices;