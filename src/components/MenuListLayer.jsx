"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Table, Button, Skeleton, message, Popconfirm, Image } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Api from "../api";

const MenuListLayer = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await Api.get("/menus");
        setData(response.data.menus);

        // Extract unique categories for filtering
        const uniqueCategories = [
          ...new Set(response.data.menus.map((menu) => menu.kategori)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/menus/${id}`);
      setData((prevData) => prevData.filter((menu) => menu.id_menu !== id));
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
      title: "Gambar",
      dataIndex: "image_url",
      key: "image_url",
      render: (text) => <Image src={text} alt="image_url" width={50} />,
    },
    {
      title: "Nama Menu",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      key: "deskripsi",
    },
    {
      title: "Harga",
      dataIndex: "harga",
      key: "harga",
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      filters: categories.map((category) => ({
        text: category,
        value: category,
      })),
      onFilter: (value, record) => record.kategori === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className='d-flex gap-2'>
          <Button
            type='link'
            icon={<Icon icon='lucide:edit' />}
            className='text-success-main'
            href={`menu-edit?id=${record.id_menu}`} // Pass id_menu as a query parameter
          />
          <Popconfirm
            title="Hapus Menu"
            description="Apakah Anda yakin ingin menghapus menu ini?"
            onConfirm={() => handleDelete(record.id_menu)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type='link'
              icon={<Icon icon='mingcute:delete-2-line' />}
              className='text-danger-main'
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className='card'>
      {contextHolder}
      <div className='card-header d-flex justify-content-end'>
        <Link href='menu-add' className='btn btn-sm btn-primary-600'>
          <i className='ri-add-line' /> Tambah Menu
        </Link>
      </div>
      <div className='card-body'>
        {loading ? ( // Show Skeleton while loading
          <Skeleton active />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
            rowKey="id_menu"
          />
        )}
      </div>
    </div>
  );
};

export default MenuListLayer;
