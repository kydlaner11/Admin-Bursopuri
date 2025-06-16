"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Table, Switch, Skeleton, message, Button, ConfigProvider } from "antd";
import { useState, useEffect } from "react";
import Api from "../api";
import { formatToIDRCurrency } from "../utils/formatCurrency"; 

const MenuStockLayer = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
 const [messageApi, contextHolder] = message.useMessage();

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
      messageApi.error("Gagal memuat data menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleStockToggle = async (menuId, checked) => {
    try {
      await Api.put(`/menus/${menuId}/stock`, { tersedia: checked });
      messageApi.success("Status stok berhasil diperbarui.");
      setData((prevData) =>
        prevData.map((menu) =>
          menu.id_menu === menuId ? { ...menu, tersedia: checked } : menu
        )
      );
    } catch (error) {
      console.error("Error updating stock status:", error);
      messageApi.error("Gagal memperbarui status stok.");
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
       render: (text) => formatToIDRCurrency(text),
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
      title: "Stok",
      key: "keterangan",
      render: (_, record) => {
        if (record.status_stok === false && record.jumlah_stok == null) {
          return <p style={{ fontStyle: "italic"}}>Selalu tersedia</p>;
        }
        if (record.status_stok === true && record.jumlah_stok === 0) {
          return "Habis";
        }
        if (record.status_stok === true && record.jumlah_stok > 0) {
          return record.jumlah_stok + " " + "pcs";
        }
        if (record.status_stok === false && record.jumlah_stok != null) {
          return "Tidak tersedia";
        }
        return "-";
      },
    },
   {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
        <ConfigProvider
          theme={{
            components: {
              Switch: {
                colorPrimary: '#7C0000',
                colorPrimaryHover: '#9A0000',
              },
            },
          }}
        >
          <Switch
            checked={record.tersedia}
            onChange={(checked) => handleStockToggle(record.id_menu, checked)}
          />
        </ConfigProvider>
        {record.status_stok === true && (
          <Button
            type='link'
            icon={<Icon icon='lucide:edit' />}
            style={{ color: '#7C0000' }}
            href={`menu-stock-edit?id=${record.id_menu}`} // Pass id_menu as a query parameter
          >
            Edit Stok
          </Button>
        )}
        </>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
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
    </>
  );
};

export default MenuStockLayer;
