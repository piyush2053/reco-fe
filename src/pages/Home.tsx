import { useEffect, useState } from "react";
import api from "../utils/api";
import { Button, Input, Select, Popover } from "antd";
import React from 'react'

const Home = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [user, setUser] = useState("rishi");
  const [expenseBy, setExpenseBy] = useState("piyush");
  const [desc, setDesc] = useState("");
  const [settlement, setSettlement] = useState<number>(0);
  const [tab, setTab] = useState<"contribution" | "expense">("contribution");
  const [openSettle, setOpenSettle] = useState(false);
  const [settling, setSettling] = useState(false);

  const loadAll = async () => {
    const [walletRes, settlementRes] = await Promise.all([
      api.get("/wallet"),
      api.get("/settlement"),
    ]);
    setWallet(walletRes.data);
    setSettlement(settlementRes.data.piyushOwesRishi);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addContribution = async () => {
    await api.post("/contribution", { user, amount });
    setAmount(0);
    loadAll();
  };

  const addExpense = async () => {
    await api.post("/expense", {
      paidBy: expenseBy,
      amount,
      description: desc,
    });
    setAmount(0);
    setDesc("");
    loadAll();
  };

  const confirmSettle = async () => {
    try {
      setSettling(true);
      await api.post("/settle");
      setOpenSettle(false);
      loadAll();
    } finally {
      setSettling(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#0B1220] mx-5 text-white p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Kitchen Hisaab</h1>
      </div>

      {/* Settlement Banner */}
      <div
        className={`rounded-xl p-4 mb-4 ${settlement > 0 ? "bg-red-500/20" : "bg-green-500/20"
          }`}
      >
        {settlement > 0 ? (
          <>
            <p className="text-sm text-red-400">Pending Settlement</p>
            <p className="text-xl font-bold text-red-500 mb-3">
              Piyush owes Rishi ₹{settlement}
            </p>
            <Popover
              open={openSettle}
              onOpenChange={setOpenSettle}
              trigger="click"
              placement="bottom"
              content={
                <div className="w-56">
                  <p className="text-sm mb-2">
                    Piyush, have you given{" "}
                    <b>₹{settlement}</b> to Rishi?
                  </p>

                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      size="small"
                      onClick={() => setOpenSettle(false)}
                    >
                      No
                    </Button>

                    <Button
                      danger
                      size="small"
                      loading={settling}
                      onClick={confirmSettle}
                    >
                      Yes, Settled
                    </Button>
                  </div>
                </div>
              }
            >
              <Button
                danger
                size="small"
              >
                Settle Now
              </Button>
            </Popover>

          </>
        ) : (
          <p className="text-green-400 font-semibold">All settled</p>
        )}

      </div>

      {/* Stats */}
      {wallet && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard
            title="Wallet Balance"
            value={`₹${wallet.balance}`}
            active
          />

          <StatCard
            title="Expenses"
            value={`₹${wallet.totalExpenses}`}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 bg-[#121A2F] rounded-lg overflow-hidden">
        <Tab
          active={tab === "contribution"}
          onClick={() => setTab("contribution")}
        >
          Contribution
        </Tab>
        <Tab
          active={tab === "expense"}
          onClick={() => setTab("expense")}
        >
          Expense
        </Tab>
      </div>

      {/* Form */}
      <div className="bg-[#121A2F] rounded-xl p-4 space-y-3">
        <Input
          type="number"
          placeholder="₹ Amount"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
        />

        {tab === "contribution" ? (
          <>
            <Select
              value={user}
              onChange={setUser}
              className="w-full"
              options={[
                { label: "Rishi", value: "rishi" },
                { label: "Piyush", value: "piyush" },
              ]}
            />
            <Button
              type="primary"
              block
              onClick={addContribution}
              className="bg-blue-600"
            >
              Add Funds to Pool
            </Button>
          </>
        ) : (
          <>
            <Select
              value={expenseBy}
              onChange={setExpenseBy}
              className="w-full"
              options={[
                { label: "Piyush", value: "piyush" },
                { label: "Rishi", value: "rishi" },
              ]}
            />
            <Input
              placeholder="Description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <Button
              type="primary"
              block
              onClick={addExpense}
            >
              Add Expense
            </Button>
          </>
        )}
      </div>

      {/* Report */}
      <Button
        className="mt-5"
        block
        type="primary"
        onClick={() =>
          window.open("https://latik-be.vercel.app/statement", "_blank")
        }
      >
        View Account Statement
      </Button>
    </div>
  );
};

export default Home;

/* ---------- Small Components ---------- */

const StatCard = ({
  title,
  value,
  active,
}: {
  title: string;
  value: string;
  active?: boolean;
}) => (
  <div
    className={`rounded-xl p-3 text-center ${active ? "bg-blue-600" : "bg-[#121A2F]"
      }`}
  >
    <p className="text-xs opacity-70">{title}</p>
    <p className="font-bold">{value}</p>
  </div>
);

const Tab = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-sm ${active
      ? "bg-blue-600 text-white"
      : "text-gray-400"
      }`}
  >
    {children}
  </button>
);
