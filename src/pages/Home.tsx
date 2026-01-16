import { useEffect, useState } from "react";
import api from "../utils/api";
import { Button, Input, Select, Card as AntCard } from "antd";

const Card: any = AntCard;

const Home = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [user, setUser] = useState<string>("rishi");
  const [expenseBy, setExpenseBy] = useState<string>("piyush");
  const [desc, setDesc] = useState<string>("");
  const [settlement, setSettlement] = useState<number>(0);

  const loadWallet = async () => {
    const res = await api.get("/wallet");
    setWallet(res.data);
  };
  const loadSettlement = async () => {
    const res = await api.get("/settlement");
    setSettlement(res.data.piyushOwesRishi);
  };
  useEffect(() => {
    loadWallet();
    loadSettlement();
  }, []);



  const addContribution = async () => {
    await api.post("/contribution", { user, amount });
    setAmount(0);
    loadWallet();
  };

  const addExpense = async () => {
    await api.post("/expense", {
      paidBy: expenseBy,
      amount,
      description: desc,
    });
    setAmount(0);
    setDesc("");
    loadWallet();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🍳 Kitchen Hisaab</h1>

      {/* Wallet */}
      <Card title="Wallet Summary">
        {wallet && (
          <>
            <p>Balance: ₹ {wallet.balance}</p>
            <p>Total Contribution: ₹ {wallet.totalContributions}</p>
            <p>Total Expense: ₹ {wallet.totalExpenses}</p>
          </>
        )}
      </Card>
      <Card title="Settlement Summary">
        {settlement > 0 ? (
          <p className="text-red-600 font-semibold">
            Piyush owes Rishi ₹ {settlement}
          </p>
        ) : (
          <p className="text-green-600 font-semibold">
            All settled 👍 No dues
          </p>
        )}
      </Card>

      {/* Contribution */}
      <Card title="Add Contribution">
        <Select
          value={user}
          onChange={setUser}
          options={[
            { label: "Rishi", value: "rishi" },
            { label: "Piyush", value: "piyush" },
          ]}
          className="w-full mb-2"
        />

        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="mb-2"
        />

        <Button type="primary" onClick={addContribution}>
          Add Contribution (Auto Equal)
        </Button>
      </Card>

      {/* Expense */}
      <Card title="Add Expense">
        <Select
          value={expenseBy}
          onChange={setExpenseBy}
          options={[
            { label: "Piyush", value: "piyush" },
            { label: "Rishi", value: "rishi" },
          ]}
          className="w-full mb-2"
        />

        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="mb-2"
        />

        <Input
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="mb-2"
        />

        <Button type="primary" danger onClick={addExpense}>
          Add Expense
        </Button>
      </Card>

      {/* Statement */}
      <Card title="Reports">
        <Button
          onClick={() =>
            window.open("http://localhost:3001/statement", "_blank")
          }
        >
          Open Account Statement (HTML)
        </Button>
      </Card>
    </div>
  );
};

export default Home;
