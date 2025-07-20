"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Table, Skeleton, message, Button, Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import Api from "../api";
import { formatToIDRCurrency } from "../utils/formatCurrency"; 

const MenuOptionLayer = () => {
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);

  const fetchMenuOptions = async () => {
    try {
      const response = await Api.get("/menu-option"); // Sesuaikan jika ini GET
      setData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching menu options:", error);
      message.error("Gagal memuat data menu option.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/menu-option/${id}`);
      setData((prevData) => prevData.filter((item) => item.id !== id));
       messageApi.open({
        type: "success",
        content: "Option berhasil dihapus!",
      });
    } catch (error) {
      console.error("Error deleting menu option:", error);
      message.error("Gagal menghapus menu option.");
    }
  }

  useEffect(() => {
    fetchMenuOptions();
  }, []);

  const columns = [
    {
      title: "Judul",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Optional",
      dataIndex: "optional",
      key: "optional",
      render: (val) => (val ? "Ya" : "Tidak"),
    },
    {
      title: "Maksimal Pilihan",
      dataIndex: "max",
      key: "max",
    },
    {
      title: "Pilihan",
      dataIndex: "choices",
      key: "choices",
      render: (choices) => (
        <ul className="list-disc pl-4">
          {choices.map((choice, idx) => (
            <li key={idx}>
              {choice.name} - {formatToIDRCurrency(choice.price)}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Menu",
      dataIndex: "menus",
      key: "menus",
      render: (menus) => (
        <ul className="list-disc pl-4">
          {menus.map((menu, idx) => (
            <li key={idx}>{menu.nama}</li>
          ))}
        </ul>
      ),
    },
    {
          title: "Action",
          key: "action",
          render: (_, record) => (
            <div className='d-flex gap-2'>
              <Button
                type='link'
                icon={<Icon icon='lucide:edit' />}
                style={{ color: '#7C0000' }}
                href={`options-edit?id=${record.id}`} // Pass id_menu as a query parameter
              />
              <Popconfirm
                title="Hapus Menu"
                description="Apakah Anda yakin ingin menghapus menu ini?"
                onConfirm={() => handleDelete(record.id)}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                okText="Ya"
                cancelText="Batal"
              >
                <Button
                  type='link'
                  icon={<Icon icon='mingcute:delete-2-line' />}
                  style={{ color: '#7C0000' }}
                />
              </Popconfirm>
            </div>
          ),
        },
  ];

  return (
    <div className="card">
      {contextHolder}
      <div className='card-header d-flex justify-content-end'>
        <Link 
          href='options-add' 
          className='btn btn-sm'
          style={{ 
            backgroundColor: '#7C0000', 
            borderColor: '#7C0000',
            color: 'white'
          }}
        >
          <i className='ri-add-line' /> Tambah Pilihan
        </Link>
      </div>
      <div className="card-body">
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

export default MenuOptionLayer;
