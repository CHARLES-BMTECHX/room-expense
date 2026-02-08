// src/pages/ExpenseList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Modal, Form, Input, DatePicker, Tag,
  Space, Popconfirm, Card, Spin, Alert, Typography, Table, Checkbox
} from 'antd';
import {
  Edit, Trash2, MessageSquare, IndianRupee, User, Calendar, Plus, Download, Trash, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Title, Text } = Typography;
const API_BASE = import.meta.env.VITE_BASE_URI;

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form] = Form.useForm();

  // Bulk Delete State
  const [selectedRows, setSelectedRows] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/expenses`);
      setExpenses(res.data.expenses || []);
      setTotalExpense(res.data.totalExpense || 0);
    } catch (err) {
      toast.error('Error loading expenses');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (expenses.length === 0) return toast.error("No data to export");
    const summary = [{ Description: "TOTAL EXPENSE", Amount: totalExpense }];
    const data = expenses.map((e, i) => ({
      'S.No': i + 1,
      Description: e.description,
      Amount: e.amount,
      'Paid By': e.paidBy,
      Date: dayjs(e.date).format('DD MMM YYYY'),
    }));
    const ws = XLSX.utils.json_to_sheet([...summary, {}, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), "expense_report.xlsx");
    toast.success("Exported successfully!");
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE}/expenses/${id}`);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return toast.warn("No expenses selected");
    setBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await axios.delete(`${API_BASE}/expenses/bulk-delete`, {
        data: { ids: selectedRows }
      });
      toast.success("Selected expenses deleted & balance updated!");
      setSelectedRows([]);
      setBulkDeleteModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const showEditModal = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      date: dayjs(expense.date),
    });
    setEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`${API_BASE}/expenses/${editingExpense._id}`, {
        ...values,
        date: values.date.toISOString(),
      });
      toast.success("Updated successfully");
      setEditModalVisible(false);
      form.resetFields();
      fetchExpenses();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const hasSelected = selectedRows.length > 0;

  const columns = [
    { title: 'S.No', render: (_, __, i) => i + 1, width: 70 },
    {
      title: 'Description',
      dataIndex: 'description',
      render: text => <Space><MessageSquare className="w-4 h-4 text-gray-500" /><span className="font-medium">{text}</span></Space>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: amt => <Tag color="red" className="font-semibold">-₹{amt.toLocaleString('en-IN')}</Tag>

    },
    { title: 'Paid By', dataIndex: 'paidBy', render: text => <Space><User className="w-4 h-4 text-gray-500" />{text}</Space> },
    { title: 'Date', dataIndex: 'date', render: date => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Edit className="w-4 h-4" />} onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete?" onConfirm={() => deleteExpense(record._id)}>
            <Button size="small" danger icon={<Trash2 className="w-4 h-4" />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const ExpenseCard = ({ expense, index }) => {
    const checked = selectedRows.includes(expense._id);
    return (
      <Card className={`mb-4 shadow-md border-l-4 border-red-500 hover:shadow-lg ${checked ? 'ring-2 ring-red-500 bg-red-50' : ''}`}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onChange={(e) => {
              setSelectedRows(prev =>
                e.target.checked
                  ? [...prev, expense._id]
                  : prev.filter(id => id !== expense._id)
              );
            }}
          />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <Text strong className="text-lg">{expense.description}</Text>
              <Tag color="volcano">#{index + 1}</Tag>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <IndianRupee className="w-4 h-4" />
                <span>-₹{expense.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" /> Paid by: <strong>{expense.paidBy}</strong>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" /> {dayjs(expense.date).format('DD MMMM YYYY')}
              </div>
            </div>
          </div>
          <Space>
            <Button size="small" icon={<Edit className="w-4 h-4" />} onClick={() => showEditModal(expense)} />
            <Popconfirm title="Delete?" onConfirm={() => deleteExpense(expense._id)}>
              <Button size="small" danger icon={<Trash2 className="w-4 h-4" />} />
            </Popconfirm>
          </Space>
        </div>
      </Card>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Title level={3} className="m-0">Expense History</Title>
        <Space wrap>
          <Button icon={<Download className="w-4 h-4" />} onClick={exportToExcel}>Export</Button>
          {hasSelected && (
            <Button danger type="primary" loading={isBulkDeleting} icon={<Trash className="w-4 h-4" />} onClick={handleBulkDelete}>
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <Link to="/add-expense">
            <Button type="primary" icon={<Plus className="w-4 h-4" />}>Add Expense</Button>
          </Link>
        </Space>
      </div>

      {hasSelected && (
        <Alert message={`${selectedRows.length} selected`} type="info" showIcon className="mb-4"
          action={<Button size="small" onClick={() => setSelectedRows([])}>Clear</Button>}
        />
      )}

      <Card className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500">
        <div className="flex justify-between items-center">
          <div>
            <Text type="secondary">Total Expenses</Text>
            <Title level={2} className="m-0 text-red-600">₹{totalExpense.toLocaleString('en-IN')}</Title>
          </div>
          <IndianRupee className="w-12 h-12 text-red-500 opacity-80" />
        </div>
      </Card>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="mb-4">
          <Button size="small" onClick={() => setSelectedRows(selectedRows.length === expenses.length ? [] : expenses.map(e => e._id))}>
            {selectedRows.length === expenses.length ? "Deselect" : "Select"} All
          </Button>
        </div>
        {expenses.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            No expenses yet. <Link to="/add-expense" className="text-blue-600">Add one!</Link>
          </Card>
        ) : (
          expenses.map((e, i) => <ExpenseCard key={e._id} expense={e} index={i} />)
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedRows,
            onChange: setSelectedRows,
          }}
          columns={columns}
          dataSource={expenses}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Edit Modal */}
      <Modal title="Edit Expense" open={editModalVisible} onCancel={() => { setEditModalVisible(false); form.resetFields(); }} footer={null}>
        <Form form={form} onFinish={handleEdit} layout="vertical">
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input prefix={<MessageSquare className="w-4 h-4 text-gray-400" />} />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input prefix={<IndianRupee className="w-4 h-4 text-gray-400" />} type="number" />
          </Form.Item>
          <Form.Item name="paidBy" label="Paid By" rules={[{ required: true }]}>
            <Input prefix={<User className="w-4 h-4 text-gray-400" />} />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Update</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Confirm Delete</div>}
        open={bulkDeleteModal}
        onCancel={() => !isBulkDeleting && setBulkDeleteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setBulkDeleteModal(false)} disabled={isBulkDeleting}>Cancel</Button>,
          <Button key="delete" danger type="primary" loading={isBulkDeleting} onClick={confirmBulkDelete}>
            Delete {selectedRows.length} Expenses
          </Button>
        ]}
      >
        <p className="text-red-700 font-medium">This action cannot be undone!</p>
        <p>You are about to delete <strong>{selectedRows.length}</strong> expense(s). The amount will be refunded to balance.</p>
      </Modal>
    </div>
  );
}

export default ExpenseList;
