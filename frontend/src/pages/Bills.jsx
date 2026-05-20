import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


const statusColor = (status) => {
  if (status === "paid") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "bg-red-100 text-red-600";
  return "bg-yellow-100 text-yellow-700";
};

export default function Bills() {
  const [bills, setBills] = useState([]);

  const load = () => axios.get("/api/bills/").then(r => setBills(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await axios.patch(`/api/bills/${id}/status?status=${status}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bills</h1>
        <Link to="/bills/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition shadow">
          + New Bill
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 text-xs">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Total</th>
              <th className="text-right p-4">Date</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-gray-500">#{b.id}</td>
                <td className="p-4 text-gray-800">{b.customer_name || "Walk-in"}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}>{b.status}</span>
                </td>
                <td className="p-4 text-right font-medium text-gray-800">₹{parseFloat(b.total).toLocaleString("en-IN")}</td>
                <td className="p-4 text-right text-gray-400">{new Date(b.created_at).toLocaleDateString()}</td>
               <td className="p-4 text-right">
  <Link to={`/bills/${b.id}`} className="text-xs text-blue-500 hover:underline mr-3">View</Link>
  {b.status === "draft" && (
    <>
      <button onClick={() => updateStatus(b.id, "paid")} className="text-xs text-emerald-500 hover:underline mr-3">Mark Paid</button>
      <button onClick={() => updateStatus(b.id, "cancelled")} className="text-xs text-red-400 hover:underline">Cancel</button>
    </>
  )}
</td>
                <td className="p-4 text-right">
                  {b.status === "draft" && (
                    <>
                      <button onClick={() => updateStatus(b.id, "paid")} className="text-xs text-emerald-500 hover:underline mr-3">Mark Paid</button>
                      <button onClick={() => updateStatus(b.id, "cancelled")} className="text-xs text-red-400 hover:underline">Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!bills.length && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No bills yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}