import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Card, Row, Col } from 'antd';
import { User, DollarSign, Calendar, Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BASE_URI;

function AddDeposit() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        amount: Number(values.amount),
        date: dayjs(values.date).format('YYYY-MM-DD'),
      };

      await axios.post(`${API_BASE}/deposits`, payload);

      toast.success('Deposit added successfully!');

      // Reset form but keep today's date
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });

      navigate('/deposits');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    toast.error('Please fill all required fields correctly.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Add New Deposit
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Deposited By"
                  rules={[{ required: true, message: 'Please enter name' }]}
                >
                  <Input
                    prefix={<User className="w-4 h-4 text-gray-400" />}
                    placeholder="e.g., John Doe"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    { pattern: /^\d+$/, message: 'Enter a valid number' }
                  ]}
                >
                  <Input
                    prefix={<DollarSign className="w-4 h-4 text-gray-400" />}
                    type="number"
                    placeholder="50000"
                    size="large"
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                  initialValue={dayjs()} // Today by default
                >
                  <DatePicker
                    className="w-full"
                    size="large"
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                disabled={loading}
                icon={loading ? null : <Plus className="w-5 h-5" />}
                className="h-12 text-base font-semibold bg-green-600 hover:bg-green-700 border-0"
              >
                {loading ? 'Adding Deposit...' : 'Add Deposit'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default AddDeposit;
