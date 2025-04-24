"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Table, Button, Skeleton, message, Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Api from "../api";

const CategoryLayer = () => {
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [messageApi, contextHolder] = message.useMessage(); // Add message API

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await Api.get("/categories");
        setCategories(response.data.menu);
      } catch (error) {
        console.error("Error fetching categories:", error);
        messageApi.error("Gagal memuat kategori.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/categories/${id}`);
      setCategories((prevData) => prevData.filter((category) => category.id_category !== id));
      messageApi.open({
        type: "success",
        content: "Menu berhasil dihapus!",
      });
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<Icon icon="lucide:edit" />}
            className="text-success-main"
            href={`category-edit?id=${record.id}`}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Menu"
            description="Apakah Anda yakin ingin menghapus kategori ini?"
            onConfirm={() => handleDelete(record.id)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type='link'
              icon={<Icon icon="lucide:delete" />}
              className='text-danger-main'
            >
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="card">
      {contextHolder}
      <div className="card-header d-flex justify-content-end">
        <Link href="category-add" className="btn btn-sm btn-primary-600">
          <Icon icon="ri-add-line" /> Tambah Kategori
        </Link>
      </div>
      <div className="card-body">
        {loading ? ( // Show Skeleton while loading
          <Skeleton active />
        ) : (
          <Table
            columns={columns}
            dataSource={categories}
            pagination={{ pageSize: 10 }}
            rowKey="id_category" // Use a unique key from the API response
          />
        )}
      </div>
    </div>
  );
};

export default CategoryLayer;
