import { useState } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  Menu as MenuIcon,
  BarChart3,
  TrendingUp,
  Wallet,
  PlusCircle,
} from "lucide-react";
import logo from "./assets/logo.png";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Header, Content } = Layout;

export default function App() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { key: "/balance", icon: <BarChart3 className="w-4 h-4" />, label: <Link to="/balance">Balance</Link> },
    { key: "/deposits", icon: <TrendingUp className="w-4 h-4" />, label: <Link to="/deposits">Deposits</Link> },
    { key: "/expenses", icon: <Wallet className="w-4 h-4" />, label: <Link to="/expenses">Expenses</Link> },
    { key: "/add-deposit", icon: <PlusCircle className="w-4 h-4" />, label: <Link to="/add-deposit">Add Deposit</Link> },
    { key: "/add-expense", icon: <PlusCircle className="w-4 h-4" />, label: <Link to="/add-expense">Add Expense</Link> },
  ];

  return (
    <Layout className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {/* HEADER */}
      <Header className="bg-white  shadow-sm px-4 sm:px-8 flex items-center justify-between h-16">

        <div className="text-xl font-semibold tracking-wide text-white flex items-center space-x-2">
          <img src={logo} alt="logo" width="50px" height="50px" />  <span>Finance Manager</span>
        </div>

       

        {/* Mobile Toggle (show ONLY below sm) */}
        <Button
          className="sm:hidden flex items-center border-none shadow-none"
          icon={<MenuIcon className="w-7 h-7 text-gray-700 " />}
          onClick={() => setOpen(true)}
        />
      </Header>

      {/* MOBILE DRAWER */}
      <Drawer
        title="Navigation"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={250}
        styles={{ body: { padding: 0 } }}

      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={() => setOpen(false)}
        />
      </Drawer>

      {/* CONTENT */}
      <Content className="p-4 sm:p-8">
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
