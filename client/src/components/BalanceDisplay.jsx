import { useEffect, useState } from 'react';
import { Card, Row, Col, Alert, Button } from 'antd';
import { DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';


const API_BASE = import.meta.env.VITE_BASE_URI;

function BalanceDisplay() {
  const [balance, setBalance] = useState({ capitalAmount: 0, currentAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/balance`);
      setBalance({
        capitalAmount: Number(res.data.capitalAmount),
        currentAmount: Number(res.data.currentAmount),
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch balance. Please try again.');
      toast.error('Error fetching balance.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "INR",
    });

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card className="shadow-lg">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading balance...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Current Balance
        </h2>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Row gutter={16} justify="center" className='mt-2'>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Card
              className="text-center bg-green-50 border-green-200 h-full"
              hoverable
              bodyStyle={{ padding: '20px' }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Capital</h3>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 break-all leading-tight">
                {formatCurrency(balance.capitalAmount)}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Card
              className="text-center bg-blue-50 border-blue-200 h-full"
              hoverable
              bodyStyle={{ padding: '20px' }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Current</h3>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 break-all leading-tight">
                {formatCurrency(balance.currentAmount)}
              </p>
            </Card>
          </Col>
        </Row>

        <div className="mt-4 text-center">
          <Button
            type="link"
            onClick={fetchBalance}
            icon={<RefreshCw className="w-4 h-4" />}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BalanceDisplay;
