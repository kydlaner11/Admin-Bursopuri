"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Table, Switch, Spin, Skeleton, message } from "antd";
import { useState, useEffect } from "react";
import Api from "../api";

const MenuStockLayer = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = async () => {
    try {
      const response = await Api.get("/menus");
      setData(response.data.menus);

      const uniqueCategories = [
        ...new Set(response.data.menus.map((menu) => menu.kategori)),
      ];
      setCategories(uniqueCategories); // Sesuaikan struktur data dari API
    } catch (error) {
      console.error("Error fetching menus:", error);
      message.error("Gagal memuat data menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleStockToggle = async (menuId, checked) => {
    try {
      await Api.put(`/menus/${menuId}/stock`, { status_stok: checked });
      message.success("Status stok berhasil diperbarui.");
      setData((prevData) =>
        prevData.map((menu) =>
          menu.id_menu === menuId ? { ...menu, status_stok: checked } : menu
        )
      );
    } catch (error) {
      console.error("Error updating stock status:", error);
      message.error("Gagal memperbarui status stok.");
    }
  };

  const columns = [
    {
      title: "Nama Menu",
      dataIndex: "nama",
      key: "nama",
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
        <Switch
          checked={record.status_stok}
          onChange={(checked) => handleStockToggle(record.id_menu, checked)}
        />
      ),
    },
  ];

  return (
    <div className='card'>
      <div className='card-header d-flex justify-content-end'>
        {/* <Link href='menu-add' className='btn btn-sm btn-primary-600'>
          <i className='ri-add-line' /> Tambah Produk
        </Link> */}
      </div>
      <div className='card-body'>
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} /> // Skeleton saat loading
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id_menu"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

export default MenuStockLayer;
