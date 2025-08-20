import { useEffect, useState } from "react";
import { core_services } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Home = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await core_services.getExcelDataToday();
      setData(res);
    };
    fetchData();
  }, []);

  if (!data) return <div className="text-white text-center mt-10">Loading...</div>;

  // Prepare chart data
  const summaryData = [
    { name: "Sales", value: data.summary.salesValue },
    { name: "Purchase", value: data.summary.purchaseValue },
    { name: "Receipts", value: data.summary.receipts },
    { name: "Payments", value: data.summary.payments }
  ];

  const taxData = [
    { name: "CGST", value: data.summary.taxes.cgst },
    { name: "SGST", value: data.summary.taxes.sgst },
    { name: "IGST", value: data.summary.taxes.igst }
  ];

  return (
    <div className="p-4 bg-bg1 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">{data.companyName} - {data.bookName}</h1>
      <p className="mb-6">Export Date: {data.exportDate}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryData.map((item, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
            <span className="text-sm">{item.name}</span>
            <span className="text-xl font-bold">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Sales vs Purchase vs Receipts Bar Chart */}
      <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="mb-2 font-semibold">Voucher Summary</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryData}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Bar dataKey="value" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Taxes Pie Chart */}
      <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="mb-2 font-semibold">Taxes Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={taxData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {taxData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Orders Table */}
      <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="mb-2 font-semibold">Pending Orders</h2>
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Voucher</th>
              <th className="px-4 py-2 text-left">Party</th>
              <th className="px-4 py-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.vouchers.map((v: any, idx: number) => (
              <tr key={idx} className="border-t border-gray-700">
                <td className="px-4 py-2">{v.voucherNumber} ({v.voucherType})</td>
                <td className="px-4 py-2">{v.partyLedger}</td>
                <td className="px-4 py-2">{v.totals.grandTotal || v.totals.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
