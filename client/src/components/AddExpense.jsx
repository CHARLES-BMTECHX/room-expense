import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Row, Col, Spin,Card  } from 'antd';
import { MessageSquare, DollarSign, User, Calendar, Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE = import.meta.env.VITE_BASE_URI;

function AddExpense() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

const onFinish = async (values) => {
  setLoading(true);
  try {
    const payload = {
      description: values.description,
      amount: Number(values.amount),
      paidBy: values.paidBy,
      date: dayjs(values.date).format('YYYY-MM-DD'),
    };

    await axios.post(`${API_BASE}/expenses`, payload);

    toast.success('Expense added successfully!');

    // Reset form + set default date to today again
    form.resetFields();
    form.setFieldsValue({ date: dayjs() }); // Optional: keep today's date after reset

    navigate('/expenses');
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to add expense.');
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
        <Card className="shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Add New Expense
          </h2>

          <Form
            form={form}
            name="addExpense"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Enter description' }]}
                >
                  <Input
                    prefix={<MessageSquare className="w-4 h-4 text-gray-400" />}
                    placeholder="e.g., Dinner with team"
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
                    { required: true, message: 'Enter amount' },
                    { pattern: /^\d+$/, message: 'Enter a valid number' }
                  ]}
                >
                  <Input
                    prefix={<DollarSign className="w-4 h-4 text-gray-400" />}
                    type="number"
                    placeholder="2500"
                    size="large"
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="paidBy"
                  label="Paid By"
                  rules={[{ required: true, message: 'Enter name' }]}
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
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: 'Select date' }]}
                  initialValue={dayjs()}
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
                loading={loading} // AntD built-in spinner
                disabled={loading} // disable when loading
                icon={loading ? null : <Plus className="w-4 h-4" />}
                className="font-medium"
              >
                {loading ? 'Adding Expense...' : 'Add Expense'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default AddExpense;
