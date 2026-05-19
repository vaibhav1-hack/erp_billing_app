import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [bills, setBills] = useState([]);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios.get("/api/bills/").then(r => setBills(r.data));
    axios.get("/api/items/").then(r => setItems(r.data));
    axios.get("/api/customers/").then(r => setCustomers(r.data));
  }, []);

  const revenue = bills.filter(b => b.status === "paid").reduce((s, b) => s + parseFloat(b.total), 0);

  const stats = [
    { label: "Total Bills", value: bills.length, bg: "bg-blue-500", icon: "🧾" },
    { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, bg: "bg-emerald-500", icon: "💰" },
    { label: "Items", value: items.length, bg: "bg-violet-500", icon: "📦" },
    { label: "Customers", value: customers.length, bg: "bg-orange-400", icon: "👥" },
  ];

  const statusColor = (status) => {
    if (status === "paid") return "bg-emerald-100 text-emerald-700";
    if (status === "cancelled") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/bills/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition shadow">
          + New Bill
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, bg, icon }) => (
          <div key={label} className={`${bg} rounded-xl p-5 text-white shadow-md`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-sm opacity-80">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-800 font-semibold">Recent Bills</h2>
          <Link to="/bills" className="text-xs text-blue-500 hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-100">
              <th className="text-left pb-2">ID</th>
              <th className="text-left pb-2">Customer</th>
              <th className="text-left pb-2">Status</th>
              <th className="text-right pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {bills.slice(0, 5).map(b => (
              <tr key={b.id} className="border-b border-gray-100 text-gray-600">
                <td className="py-2 font-mono">#{b.id}</td>
                <td className="py-2">{b.customer_name || "Walk-in"}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-2 text-right font-medium">₹{parseFloat(b.total).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {!bills.length && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No bills yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}