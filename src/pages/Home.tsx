import { useEffect, useState, useMemo } from "react";
import { core_services } from "../utils/api";
import Loader from "../components/Loader";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Progress } from "antd";

const Home = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await core_services.getExcelDataToday();
        setData(res || []);
      } catch (e) {
        setData([]);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num: number) =>
    typeof num === "number" && !isNaN(num) ? num.toLocaleString("en-IN") : "0";

  const normalizeCity = (city: string) => {
    if (!city) return "Unknown";
    const clean = city.trim().toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const clients: Record<string, { pending: any[]; fulfilled: any[]; city: string }> = {};
  (data || []).forEach((v) => {
    if (!v || !v.voucherNo) return;

    const clientName = v.particulars || "Unknown Client";
    let city = "Unknown";
    const match = clientName.match(/\((.*?)\)/);
    if (match) city = normalizeCity(match[1]);

    if (!clients[clientName]) {
      clients[clientName] = { pending: [], fulfilled: [], city };
    }

    const orderRef = (v.orderReferenceNo || "").toUpperCase();
    const isPending = orderRef.includes("PENDING") || orderRef.includes("PEDING");

    if (isPending) {
      clients[clientName].pending.push(v);
    } else {
      clients[clientName].fulfilled.push(v);
    }
  });

  const cities = useMemo(() => {
    const allCities = Object.values(clients).map((c) => normalizeCity(c.city));
    return ["All", ...Array.from(new Set(allCities))];
  }, [clients]);


  if (!data || data.length === 0) return <Loader />;

  const totalSales = (data || []).reduce(
    (sum, v) => sum + (v?.grossTotal || v?.value || 0),
    0
  );
  const totalQty = (data || []).reduce((sum, v) => sum + (v?.quantity || 0), 0);

  const summaryData = [
    { name: "Total Sales", value: formatNumber(totalSales) },
    { name: "Total Quantity", value: formatNumber(totalQty) },
    {
      name: "Total Sales Orders",
      value: formatNumber((data || []).filter((v) => v?.voucherNo).length),
    },
  ];

  const filteredClients = Object.keys(clients).filter((client) => {
    const matchesSearch = client?.toLowerCase().includes(search.toLowerCase());
    const matchesCity =
      selectedCity === "All" ||
      (clients[client]?.city || "").toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });
  const orderFields = [
    { key: "voucherNo", label: "Sales Order" },
    { key: "orderReferenceNo", label: "Order Ref" },
    { key: "quantity", label: "Qty" },
    { key: "rate", label: "Rate" },
    { key: "value", label: "Value" },
    { key: "grossTotal", label: "Gross Total" },
    { key: "sgstOutput", label: "SGST" },
    { key: "cgstOutput", label: "CGST" },
    { key: "igstOutput", label: "IGST" },
    { key: "roundOff", label: "Round Off" },
    { key: "specialDiscountOnGSTSale", label: "Special Discount" },
  ];
  const totalOrders = data.filter((v) => v?.voucherNo).length;
  const totalPending = Object.values(clients).reduce(
    (sum, c) => sum + c.pending.length,
    0
  );
  const totalFulfilled = Object.values(clients).reduce(
    (sum, c) => sum + c.fulfilled.length,
    0
  );
  const totalAmount = data.reduce(
    (sum, v) => sum + (v?.grossTotal || v?.value || 0),
    0
  );

  const totalPendingAmount = Object.values(clients).reduce(
    (sum, c) => sum + c.pending.reduce((s, o) => s + (o?.grossTotal || o?.value || 0), 0),
    0
  );

  const totalFulfilledAmount = Object.values(clients).reduce(
    (sum, c) => sum + c.fulfilled.reduce((s, o) => s + (o?.grossTotal || o?.value || 0), 0),
    0
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1">Sales Dashboard</h1>
        <p className="text-gray-400 text-sm">Showing {data.length} records from API</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="🔍 Search by Client Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-1/2"
        />

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-1/3"
        >
          {cities.map((city, i) => (
            <option key={i} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {summaryData.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-5 rounded-xl shadow-lg flex flex-col items-center"
          >
            <span className="text-gray-400 uppercase text-sm">{item.name}</span>
            <span className="text-2xl font-bold mt-2">{item.value}</span>
          </div>
        ))}
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-5 rounded-xl shadow-lg flex flex-col w-full">
          <span className="text-gray-400 uppercase text-sm">Orders Status</span>
          <div className="mt-4">
            <Progress
              percent={totalAmount > 0 ? (totalFulfilledAmount / totalAmount) * 100 : 0}
              success={{ percent: totalAmount > 0 ? (totalPendingAmount / totalAmount) * 100 : 0 }}
              strokeColor={{ from: "#facc15", to: "#22c55e" }}
              trailColor="#374151"
              showInfo={false}
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-yellow-400">
                Pending: ₹{formatNumber(totalPendingAmount)} ({totalPending})
              </span>
              <span className="text-green-400">
                Fulfilled: ₹{formatNumber(totalFulfilledAmount)} ({totalFulfilled})
              </span>
              <span className="text-gray-300">
                Total: ₹{formatNumber(totalAmount)} ({totalOrders})
              </span>
            </div>
          </div>
        </div>
{/* Orders Status Block */}
<div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full">
  <h2 className="text-lg font-semibold mb-4">Order Status</h2>

  {/* Cards Pending & Fulfilled */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
    <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
      <span className="text-gray-400 text-sm">Pending</span>
      <span className="text-xl font-bold text-yellow-400 mt-1">
        ₹{formatNumber(totalPendingAmount)}
      </span>
      <span className="text-sm text-yellow-400">({totalPending})</span>
    </div>

    <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
      <span className="text-gray-400 text-sm">Fulfilled</span>
      <span className="text-xl font-bold text-green-400 mt-1">
        ₹{formatNumber(totalFulfilledAmount)}
      </span>
      <span className="text-sm text-green-400">({totalFulfilled})</span>
    </div>
  </div>

  {/* Progress Bar */}
  <div>
    <span className="text-sm text-gray-300 mb-2 block">Fulfilled</span>
    <Progress
      percent={
        totalAmount > 0
          ? ((totalFulfilledAmount / totalAmount) * 100).toFixed(0)
          : 0
      }
      strokeColor="#3b82f6"
      trailColor="#374151"
      showInfo={false}
    />
    <p className="text-sm text-gray-400 mt-1">
      {totalAmount > 0
        ? `${((totalFulfilledAmount / totalAmount) * 100).toFixed(0)}%`
        : "0%"}
    </p>
  </div>
</div>

      </div>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-100 mb-2">Client Orders</h2>

        {filteredClients.length === 0 ? (
          <p className="text-gray-500">No clients found.</p>
        ) : (
          filteredClients.map((client, idx) => {
            const clientData = clients[client];
            if (!clientData) return null;

            return (
              <div key={idx} className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-1">{client}</h3>
                <p className="text-gray-400 text-sm mb-4">📍 {clientData.city || "Unknown"}</p>

                <div className="mb-6">
                  <h4 className="w-fit text-gray-800 px-2 font-medium mb-2 bg-yellow-500 rounded-full flex items-center">
                    <ClockCircleOutlined className="text-gray-800 mr-2" /> Pending Orders
                  </h4>
                  {clientData.pending.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700 text-left">
                        <thead>
                          <tr>
                            {orderFields.map((f, i) => (
                              <th key={i} className="px-6 py-3 text-gray-400 uppercase text-sm">
                                {f.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {clientData.pending.map((o, i) => (
                            <tr key={i} className="hover:bg-gray-700">
                              {orderFields.map((f, j) => (
                                <td key={j} className="px-6 py-3">
                                  {formatNumber(o?.[f.key]) || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No pending orders.</p>
                  )}
                </div>

                <div>
                  <h4 className="w-fit text-gray-800 font-medium mb-2 bg-green-500 px-2 rounded-full flex items-center">
                    <CheckCircleOutlined className="text-gray-800 mr-2" /> Fulfilled Orders
                  </h4>
                  {clientData?.fulfilled.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700 text-left">
                        <thead>
                          <tr>
                            {orderFields?.map((f, i) => (
                              <th key={i} className="px-6 py-3 text-gray-400 uppercase text-sm">
                                {f.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {clientData?.fulfilled.map((o, i) => ( 
                            <tr key={i} className="hover:bg-gray-700">
                              {orderFields.map((f, j) => (
                                <td key={j} className="px-6 py-3">
                                  {formatNumber(o?.[f.key]) || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No fulfilled orders.</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;