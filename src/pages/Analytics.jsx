import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

function Analytics() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/view-invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.data || []));
  }, []);

  // 📊 BASIC METRICS
  const total = invoices.length;
  const approved = invoices.filter(i => i.status === "Auto Approved").length;
  const pending = total - approved;

  const totalAmount = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount.replace(",", "")),
    0
  );

  const fraudCount = invoices.filter(
    i => i.fraud_flags && i.fraud_flags.length > 0
  ).length;

  // 🟢 PIE CHART DATA
  const pieData = [
    { name: "Approved", value: approved || 1 },
    { name: "Pending", value: pending || 1 },
  ];

  // 📊 BAR CHART (AMOUNT PER INVOICE)
  const barData = invoices.map((inv) => ({
    name: inv.invoice_number,
    amount: parseFloat(inv.amount.replace(",", "")),
  }));

  return (
    <div className="p-10 text-white">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">📊 Analytics</h1>
        <p className="text-gray-400 text-sm">
          Financial insights and trends
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm">Total Invoices</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-green-400">
            ₹{totalAmount.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm">Pending</p>
          <h2 className="text-2xl font-bold text-red-400">
            {pending}
          </h2>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm">Fraud Alerts</p>
          <h2 className="text-2xl font-bold text-yellow-400">
            {fraudCount}
          </h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* PIE */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col items-center">
          <h3 className="mb-4 text-gray-300">Approval Distribution</h3>

          <PieChart width={250} height={250}>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* BAR */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="mb-4 text-gray-300">Invoice Amounts</h3>

          <BarChart width={400} height={250} data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="amount" fill="#8b5cf6" />
          </BarChart>
        </div>

      </div>

    </div>
  );
}

export default Analytics;