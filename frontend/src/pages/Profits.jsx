import { useEffect, useState } from "react";
import axios from "axios";

export default function Profits() {
  const [profits, setProfits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    axios.get("/api/profits/").then(r => setProfits(r.data));
    axios.get("/api/profits/summary").then(r => setSummary(r.data));
  }, []);

  const filtered = profits.filter(p => {
    const date = new Date(p.bill_date);
    if (dateFrom && date < new Date(dateFrom)) return false;
    if (dateTo && date > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const filteredProfit = filtered.reduce((s, p) => s + parseFloat(p.profit), 0);
  const filteredRevenue = filtered.reduce((s, p) => s + parseFloat(p.sales_price) * p.quantity, 0);
  const filteredCost = filtered.reduce((s, p) => s + parseFloat(p.purchase_price) * p.quantity, 0);

  const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Profits</h1>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: fmt(summary.total_revenue), bg: "bg-blue-500" },
            { label: "Total Cost",    value: fmt(summary.total_cost),    bg: "bg-orange-400" },
            { label: "Total Profit",  value: fmt(summary.total_profit),  bg: "bg-emerald-500" },
            { label: "Paid Bills",    value: summary.total_bills,        bg: "bg-violet-500" },
          ].map(({ label, value, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-5 text-white shadow-md`}>
              <div className="text-sm opacity-80">{label}</div>
              <div className="text-2xl font-bold mt-1">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Date filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex items-end gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-gray-50"
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition">
          Clear
        </button>
        {(dateFrom || dateTo) && (
          <div className="ml-auto text-sm text-gray-600">
            Filtered — Revenue: <b>{fmt(filteredRevenue)}</b> · Cost: <b>{fmt(filteredCost)}</b> · Profit: <b className="text-emerald-600">{fmt(filteredProfit)}</b>
          </div>
        )}
      </div>

      {/* Profit table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500 text-xs">
              <th className="text-left p-4">Bill #</th>
              <th className="text-left p-4">Item</th>
              <th className="text-right p-4">Qty</th>
              <th className="text-right p-4">Purchase ₹</th>
              <th className="text-right p-4">Sales ₹</th>
              <th className="text-right p-4">Profit</th>
              <th className="text-right p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-gray-400">#{p.bill_id}</td>
                <td className="p-4 text-gray-800 font-medium">{p.item_name}</td>
                <td className="p-4 text-right text-gray-600">{p.quantity}</td>
                <td className="p-4 text-right text-gray-600">{fmt(p.purchase_price)}</td>
                <td className="p-4 text-right text-gray-600">{fmt(p.sales_price)}</td>
                <td className="p-4 text-right font-semibold">
                  <span className={parseFloat(p.profit) >= 0 ? "text-emerald-600" : "text-red-500"}>
                    {fmt(p.profit)}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-400">
                  {new Date(p.bill_date).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No profit records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}