import { Link } from "react-router-dom";
import { Home, BarChart3, PlusCircle } from "lucide-react";
import { Button } from "antd";

export default function HomePage() {
  return (
    <div className="text-center py-12 max-w-2xl mx-auto">
      <Home className="w-16 h-16 mx-auto text-gray-400 mb-6" />

      <h2 className="text-3xl font-bold text-gray-700 mb-4">
        Welcome to Your Expense Tracker
      </h2>

      <p className="text-lg text-gray-500 mb-8">
        Manage your finances effortlessly. Track deposits, expenses, and monitor your balance in real-time.
      </p>

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/balance">
          <Button type="primary" size="large" icon={<BarChart3 className="w-4 h-4" />}>
            View Balance
          </Button>
        </Link>

        <Link to="/add-deposit">
          <Button size="large" icon={<PlusCircle className="w-4 h-4" />}>
            Quick Add
          </Button>
        </Link>
      </div>
    </div>
  );
}
