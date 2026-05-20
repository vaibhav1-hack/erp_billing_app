import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    axios.get(`/api/bills/${id}`).then(r => setBill(r.data));
  }, [id]);

  if (!bill) return <div className="p-8 text-gray-400">Loading...</div>;

  const statusColor = (s) => {
    if (s === "paid") return "text-green-600 bg-green-100";
    if (s === "cancelled") return "text-red-500 bg-red-100";
    return "text-yellow-600 bg-yellow-100";
  };

  return (
    <div>
      {/* Action buttons - hidden on print */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button onClick={() => navigate("/bills")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition">
          ← Back
        </button>
        <button onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Bill content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-3xl mx-auto print:shadow-none print:border-none print:p-0">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-blue-600 font-bold text-3xl">BillingERP</div>
            <div className="text-gray-400 text-sm mt-1">Tax Invoice</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">Invoice #{bill.id}</div>
            <div className="text-sm text-gray-400 mt-1">
              Date: {new Date(bill.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block ${statusColor(bill.status)}`}>
              {bill.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6" />

        {/* Bill To */}
        <div className="mb-8">
  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</div>
  <div className="text-lg font-semibold text-gray-800">
    {bill.customer_name || "Walk-in Customer"}
  </div>
  {bill.customer_phone && <div className="text-sm text-gray-500 mt-1">📞 {bill.customer_phone}</div>}
  {bill.customer_email && <div className="text-sm text-gray-500">✉ {bill.customer_email}</div>}
</div>

        {/* Items table */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left px-4 py-3 rounded-tl-lg">#</th>
              <th className="text-left px-4 py-3">Item</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Qty</th>
              <th className="text-right px-4 py-3 rounded-tr-lg">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">₹{parseFloat(item.price).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                  ₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{parseFloat(bill.total).toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between py-2 text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>₹{parseFloat(bill.total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-700">Notes: </span>{bill.notes}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          Thank you for your business! · Generated by BillingERP
        </div>
      </div>
    </div>
  );
}