import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Stock() {
  const { user } = useAuth();
  const [lowStock, setLowStock] = useState([]);
  const [log, setLog] = useState([]);
  const [adjustItemId, setAdjustItemId] = useState(null);
  const [change, setChange] = useState("");
  const [reason, setReason] = useState("");

  const load = () => {
    axios.get("/api/stock/low").then(r => setLowStock(r.data));
    axios.get("/api/stock/log").then(r => setLog(r.data));
  };
  useEffect(() => { load(); }, []);

  const adjust = async () => {
    await axios.patch(`/api/stock/${adjustItemId}/adjust`, { change: parseInt(change), reason });
    setAdjustItemId(null); setChange(""); setReason("");
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Stock</h1>

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-orange-600 mb-4">⚠ Low Stock Items</h2>
          <div className="space-y-2">
            {lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{item.unit}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-orange-500 font-medium text-sm">{item.stock} left</span>
                  {user?.role === "admin" && (
                    <button onClick={() => setAdjustItemId(item.id)}
                      className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1 rounded-lg transition">
                      Adjust
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adjustItemId && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Adjust Stock</h2>
          <div className="flex gap-3 items-end">
            <div><label className="text-xs text-gray-500 block mb-1">Change (+ or -)</label>
              <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50 w-32"
                value={change} onChange={e => setChange(e.target.value)} /></div>
            <div className="flex-1"><label className="text-xs text-gray-500 block mb-1">Reason</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
                value={reason} onChange={e => setReason(e.target.value)} placeholder="restock, damaged…" /></div>
            <button onClick={adjust} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">Apply</button>
            <button onClick={() => setAdjustItemId(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Stock Log</h2>
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-xs border-b border-gray-100">
            <tr>
              <th className="text-left pb-2">Item</th>
              <th className="text-right pb-2">Change</th>
              <th className="text-left pb-2 pl-4">Reason</th>
              <th className="text-left pb-2">By</th>
              <th className="text-right pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {log.map(entry => (
              <tr key={entry.id} className="border-b border-gray-100 text-gray-600">
                <td className="py-2">{entry.item_name}</td>
                <td className={`py-2 text-right font-medium ${entry.change > 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {entry.change > 0 ? "+" : ""}{entry.change}
                </td>
                <td className="py-2 pl-4 text-gray-400">{entry.reason}</td>
                <td className="py-2 text-gray-400">{entry.user_name || "—"}</td>
                <td className="py-2 text-right text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!log.length && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No stock movements yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}