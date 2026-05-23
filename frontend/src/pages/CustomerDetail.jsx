import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    axios.get(`/api/customers/${id}`).then(r => setCustomer(r.data));
    axios.get("/api/bills/").then(r => {
      setBills(r.data.filter(b => String(b.customer_id) === String(id)));
    });
  }, [id]);

  if (!customer) return <div className="text-gray-400 p-8">Loading...</div>;

  const paid = bills.filter(b => b.status === "paid").reduce((s, b) => s + parseFloat(b.total), 0);
  const due = bills.filter(b => b.status === "draft").reduce((s, b) => s + parseFloat(b.total), 0);
  const total = paid + due;

  const statusColor = (s) => {
    if (s === "paid") return "bg-emerald-100 text-emerald-700";
    if (s === "cancelled") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

  const fmt = (n) => `₹${parseFloat(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div>
      <button onClick={() => navigate("/customers")}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Back to Customers
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center">
            {customer.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
            <div className="flex gap-4 mt-1">
              {customer.phone && <span className="text-sm text-gray-500">📞 {customer.phone}</span>}
              {customer.email && <span className="text-sm text-gray-500">✉ {customer.email}</span>}
              {customer.address && <span className="text-sm text-gray-500">📍 {customer.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bills",    value: bills.length, bg: "bg-blue-500" },
          { label: "Total Business", value: fmt(total),   bg: "bg-violet-500" },
          { label: "Amount Paid",    value: fmt(paid),    bg: "bg-emerald-500" },
          { label: "Due Amount",     value: fmt(due),     bg: due > 0 ? "bg-red-400" : "bg-gray-400" },
        ].map(({ label, value, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5 text-white shadow-md`}>
            <div className="text-sm opacity-80">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Bill History</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 text-xs">
              <th className="text-left p-4">Bill #</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Total</th>
              <th className="text-right p-4">Date</th>
              <th className="text-right p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-gray-400">#{b.id}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-4 text-right font-medium text-gray-800">{fmt(b.total)}</td>
                <td className="p-4 text-right text-gray-400">{new Date(b.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  <button onClick={() => navigate(`/bills/${b.id}`)}
                    className="text-xs text-blue-500 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {!bills.length && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No bills yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}