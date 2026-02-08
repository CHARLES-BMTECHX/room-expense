// src/pages/DepositList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Form, Input, DatePicker, Tag, Space, Popconfirm, Card, Alert, Typography, Table, Checkbox, message } from "antd";
import {
  Edit,
  Trash2,
  User,
  IndianRupee,
  Calendar,
  Plus,
  Download,
  Trash,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;
const API_BASE = import.meta.env.VITE_BASE_URI;

function DepositList() {
  const [deposits, setDeposits] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [form] = Form.useForm();

  // Selection State
  const [selectedRows, setSelectedRows] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Custom Bulk Delete Modal State
  const [bulkDeleteModalVisible, setBulkDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/deposits`);
      setDeposits(res.data.deposits || []);
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (deposits.length === 0) return toast.error("No data to export");
    const data = deposits.map((d, i) => ({
      "S.No": i + 1,
      Name: d.name,
      Amount: d.amount,
      Date: dayjs(d.date).format("DD MMM YYYY"),
    }));
    const ws = XLSX.utils.json_to_sheet([{ Name: "TOTAL", Amount: totalAmount }, {}, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deposits");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "deposits_report.xlsx");
    toast.success("Exported successfully!");
  };

  // Single Delete
  const deleteDeposit = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/deposits/${id}`);
      toast.success(res.data.message || "Deleted!");
      fetchDeposits();
    } catch (err) {
      const msg = err.response?.data?.message || "Cannot delete this deposit";
      toast.error(msg);
    }
  };

  // BULK DELETE - Custom Modal Method (100% Reliable)
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.warn("No deposits selected");
      return;
    }
    setBulkDeleteModalVisible(true);
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      console.log("Deleting these IDs:", selectedRows); // DEBUG - This will work

      const res = await axios.delete(`${API_BASE}/deposits/bulk-delete`, {
        data: { ids: selectedRows }
      });

      toast.success(res.data.message || "All selected deposits deleted!");
      setSelectedRows([]);
      setBulkDeleteModalVisible(false);
      fetchDeposits();
    } catch (err) {
      console.error("Bulk delete error:", err); // DEBUG
      toast.error(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteModalVisible(false);
  };

  const showEditModal = (deposit) => {
    setEditingDeposit(deposit);
    form.setFieldsValue({
      name: deposit.name,
      amount: deposit.amount,
      date: dayjs(deposit.date),
    });
    setEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`${API_BASE}/deposits/${editingDeposit._id}`, {
        ...values,
        date: values.date.toISOString(),
      });
      toast.success("Updated successfully");
      setEditModalVisible(false);
      form.resetFields();
      fetchDeposits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const hasSelected = selectedRows.length > 0;

  const columns = [
    { title: "S.No", render: (_, __, i) => i + 1, width: 70 },
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => (
        <Space>
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amt) => (
        <Tag color="green" className="font-semibold">
          ₹{amt.toLocaleString("en-IN")}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Edit className="w-4 h-4" />} onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this deposit?" onConfirm={() => deleteDeposit(record._id)}>
            <Button size="small" danger icon={<Trash2 className="w-4 h-4" />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const DepositCard = ({ deposit, index }) => {
    const checked = selectedRows.includes(deposit._id);
    return (
      <Card
        className={`mb-4 shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all ${
          checked ? "ring-2 ring-blue-500 bg-blue-50" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onChange={(e) => {
              setSelectedRows(
                e.target.checked
                  ? [...selectedRows, deposit._id]
                  : selectedRows.filter((id) => id !== deposit._id)
              );
            }}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <Text strong className="text-lg">{deposit.name}</Text>
              <Tag color="green">#{index + 1}</Tag>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <IndianRupee className="w-4 h-4" />
                <span>₹{deposit.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                {dayjs(deposit.date).format("DD MMMM YYYY")}
              </div>
            </div>
          </div>
          <Space>
            <Button size="small" icon={<Edit className="w-4 h-4" />} onClick={() => showEditModal(deposit)} />
            <Popconfirm title="Delete this deposit?" onConfirm={() => deleteDeposit(deposit._id)}>
              <Button size="small" danger icon={<Trash2 className="w-4 h-4" />} />
            </Popconfirm>
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Title level={3} className="m-0">Deposit History</Title>
        <Space wrap>
          <Button icon={<Download className="w-4 h-4" />} onClick={exportToExcel}>
            Export
          </Button>
          {hasSelected && (
            <Button
              danger
              type="primary"
              loading={isBulkDeleting}
              icon={<Trash className="w-4 h-4" />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <Link to="/add-deposit">
            <Button type="primary" icon={<Plus className="w-4 h-4" />}>
              Add Deposit
            </Button>
          </Link>
        </Space>
      </div>

      {/* Selection Info */}
      {hasSelected && (
        <Alert
          message={`${selectedRows.length} item(s) selected`}
          type="info"
          showIcon
          className="mb-4"
          action={
            <Button size="small" onClick={() => setSelectedRows([])}>
              Clear
            </Button>
          }
        />
      )}

      {/* Total */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
        <div className="flex justify-between items-center">
          <div>
            <Text type="secondary">Total Deposits</Text>
            <Title level={2} className="m-0 text-green-600">
              ₹{totalAmount.toLocaleString("en-IN")}
            </Title>
          </div>
          <IndianRupee className="w-12 h-12 text-green-600 opacity-80" />
        </div>
      </Card>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="mb-4 flex gap-2">
          <Button
            size="small"
            type={selectedRows.length === deposits.length && deposits.length > 0 ? "primary" : "default"}
            onClick={() => {
              if (selectedRows.length === deposits.length) {
                setSelectedRows([]);
              } else {
                setSelectedRows(deposits.map((d) => d._id));
              }
            }}
          >
            {selectedRows.length === deposits.length && deposits.length > 0 ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {deposits.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            No deposits yet. <Link to="/add-deposit" className="text-blue-600 underline">Add one!</Link>
          </Card>
        ) : (
          deposits.map((d, i) => <DepositCard key={d._id} deposit={d} index={i} />)
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedRows,
            onChange: (keys) => setSelectedRows(keys),
          }}
          columns={columns}
          dataSource={deposits}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          locale={{ emptyText: "No deposits found" }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Deposit"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
          setEditingDeposit(null);
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleEdit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
            <Input prefix={<User className="w-4 h-4" />} />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Amount is required" }]}>
            <Input prefix={<IndianRupee className="w-4 h-4" />} type="number" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: "Date is required" }]}>
            <DatePicker className="w-full" format="DD MMMM YYYY" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Deposit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom Bulk Delete Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>Confirm Bulk Delete</span>
          </div>
        }
        open={bulkDeleteModalVisible}
        onCancel={cancelBulkDelete}
        footer={[
          <Button key="cancel" onClick={cancelBulkDelete} disabled={isBulkDeleting}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isBulkDeleting}
            onClick={confirmBulkDelete}
            disabled={isBulkDeleting}
          >
            {isBulkDeleting ? "Deleting..." : `Delete ${selectedRows.length} Items`}
          </Button>,
        ]}
        width={500}
        closable={!isBulkDeleting}
        maskClosable={!isBulkDeleting}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">
                This action cannot be undone!
              </p>
              <p className="text-red-700">
                You are about to permanently delete <strong>{selectedRows.length}</strong> deposit(s)
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Text type="secondary" className="block mb-2">
              Selected deposit IDs:
            </Text>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {selectedRows.slice(0, 10).map((id, i) => (
                <Tag key={id} color="red" className="text-xs">
                  {id.slice(-8)}
                  {selectedRows.length > 10 && i === 9 && (
                    <span className="ml-1">...</span>
                  )}
                </Tag>
              ))}
              {selectedRows.length > 10 && (
                <Tag color="red">
                  +{selectedRows.length - 10} more
                </Tag>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DepositList;
