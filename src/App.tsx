import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Home from "./pages/Home";
import '../src/utils/css/custom.css'
const App = () => {
  return (
    <Router>
      <Layout className="min-h-screen bg-bg1">
        <Layout.Content>
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
          </Routes>
        </Layout.Content>
      </Layout>
    </Router>
  );
};

export default App;
