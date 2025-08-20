import { useEffect, useState } from "react";
import { core_services } from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Loader from "../components/Loader";

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

  if (!data)
    return (
      <div className="text-white text-center mt-20 text-lg font-medium">
        <Loader />
      </div>
    );

  const summaryData = [
    { name: "Sales", value: data.summary.salesValue },
    { name: "Purchase", value: data.summary.purchaseValue },
    { name: "Receipts", value: data.summary.receipts },
    { name: "Payments", value: data.summary.payments },
  ];

  const taxData = [
    { name: "CGST", value: data.summary.taxes.cgst },
    { name: "SGST", value: data.summary.taxes.sgst },
    { name: "IGST", value: data.summary.taxes.igst },
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1">{data.companyName}</h1>
        <p className="text-gray-400 text-sm">
          Book: {data.bookName} | Export Date: {data.exportDate}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {summaryData.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-5 rounded-xl shadow-lg hover:scale-105 transform transition duration-300 flex flex-col items-center"
          >
            <span className="text-gray-400 uppercase text-sm">{item.name}</span>
            <span className="text-2xl font-bold mt-2">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Voucher Summary Chart */}
      <div className="mb-10 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="mb-4 font-semibold text-lg text-gray-100">
          Voucher Summary
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryData} margin={{ top: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", borderRadius: 8 }}
              itemStyle={{ color: "#fff" }}
            />
            <Bar
              dataKey="value"
              fill="url(#colorUv)"
              radius={[5, 5, 0, 0]}
              barSize={40}
            />
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C49F" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0088FE" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Taxes Pie Chart */}
      <div className="mb-10 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="mb-4 font-semibold text-lg text-gray-100">
          Taxes Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={taxData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {taxData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Orders Table */}
      <div className="overflow-x-auto bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="mb-4 font-semibold text-lg text-gray-100">
          Pending Orders
        </h2>
        <table className="min-w-full divide-y divide-gray-700 text-left">
          <thead>
            <tr>
              {["Voucher", "Party", "Total"].map((head, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-gray-400 uppercase tracking-wider text-sm"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.vouchers.map((v: any, idx: number) => (
              <tr
                key={idx}
                className="hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="px-6 py-3 font-medium">
                  {v.voucherNumber} ({v.voucherType})
                </td>
                <td className="px-6 py-3">{v.partyLedger}</td>
                <td className="px-6 py-3">{v.totals.grandTotal || v.totals.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
