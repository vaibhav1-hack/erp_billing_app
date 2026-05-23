import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DueBills() {
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/bills/").then(r => {
      setBills(r.data.filter(b => b.status === "draft"));
    });
  }, []);

  const total = bills.reduce((s, b) => s + parseFloat(b.total), 0);
  const fmt = (n) => `₹${parseFloat(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const markPaid = async (id) => {
    await axios.patch(`/api/bills/${id}/status?status=paid`);
    setBills(bills.filter(b => b.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Due Bills</h1>
      <p className="text-gray-400 text-sm mb-8">All unpaid draft bills pending collection</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-red-400 rounded-xl p-5 text-white shadow-md">
          <div className="text-sm opacity-80">Total Due</div>
          <div className="text-2xl font-bold mt-1">{fmt(total)}</div>
        </div>
        <div className="bg-orange-400 rounded-xl p-5 text-white shadow-md">
          <div className="text-sm opacity-80">Pending Bills</div>
          <div className="text-2xl font-bold mt-1">{bills.length}</div>
        </div>
        <div className="bg-blue-500 rounded-xl p-5 text-white shadow-md">
          <div className="text-sm opacity-80">Unique Customers</div>
          <div className="text-2xl font-bold mt-1">
            {new Set(bills.filter(b => b.customer_id).map(b => b.customer_id)).size}
          </div>
        </div>
      </div>

      {/* Due bills table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 text-xs">
              <th className="text-left p-4">Bill #</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Email</th>
              <th className="text-right p-4">Due Amount</th>
              <th className="text-right p-4">Date</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-red-50 transition">
                <td className="p-4 font-mono text-gray-400">#{b.id}</td>
                <td className="p-4 font-medium text-gray-800">{b.customer_name || "Walk-in"}</td>
                <td className="p-4 text-gray-400">{b.customer_email || "—"}</td>
                <td className="p-4 text-right font-semibold text-red-500">{fmt(b.total)}</td>
                <td className="p-4 text-right text-gray-400">{new Date(b.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  <button onClick={() => navigate(`/bills/${b.id}`)}
                    className="text-xs text-blue-500 hover:underline mr-3">View</button>
                  <button onClick={() => markPaid(b.id)}
                    className="text-xs text-emerald-500 hover:underline">Mark Paid</button>
                </td>
              </tr>
            ))}
            {!bills.length && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No due bills 🎉</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}