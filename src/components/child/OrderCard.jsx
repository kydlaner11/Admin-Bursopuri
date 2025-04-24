"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Flex, Tag, Row, Col, Collapse, Skeleton } from "antd";
import { ShopOutlined, FormOutlined, SyncOutlined } from "@ant-design/icons";

const OrderCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    axios
      .get("https://jsonplaceholder.typicode.com/posts/1")
      .then(() => {
        setData([
          {
            orderId: "25610235901",
            tanggalOrder: "Mar 18, 2023",
            totalOrder: "72000",
            nama: "Michael Scott",
            tipeOrder: "Dine in",
            antrian: "302",
            status : 0,
            noteOrder: "Tanpa sambal",
            order: [
              {
                namaMenu: "Nasi Goreng Spesial",
                jumlah: 2,
                harga: "15000",
                note: "Tanpa sambal",
              },
              {
                namaMenu: "Ayam Bakar",
                jumlah: 1,
                harga: "27000",
                note: "Tambah sambal",
              },
              {
                namaMenu: "Es Teh Manis",
                jumlah: 3,
                harga: "5000",
                note: null,
              },
            ],
          },
          {
            orderId: "25610235902",
            tanggalOrder: "Mar 19, 2023",
            totalOrder: "85000",
            nama: "Dwight Schrute",
            tipeOrder: "Take Away",
            antrian: "303",
            status : 1,
            noteOrder: "Extra sambal",
            order: [
              {
                namaMenu: "Mie Goreng",
                jumlah: 2,
                harga: "20000",
                note: "Pedas",
              },
              {
                namaMenu: "Ayam Geprek",
                jumlah: 1,
                harga: "30000",
                note: "Level 5",
              },
              {
                namaMenu: "Es Jeruk",
                jumlah: 2,
                harga: "7500",
                note: null,
              },
            ],
          },
          {
            orderId: "25610235903",
            tanggalOrder: "Mar 20, 2023",
            totalOrder: "65000",
            nama: "Jim Halpert",
            tipeOrder: "Dine in",
            antrian: "304",
            status : 2,
            noteOrder: "No onions",
            order: [
              {
                namaMenu: "Burger",
                jumlah: 2,
                harga: "25000",
                note: "No pickles",
              },
              {
                namaMenu: "French Fries",
                jumlah: 1,
                harga: "15000",
                note: null,
              },
            ],
          },
        ]);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false)); // Set loading to false after fetching
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton active paragraph={{ rows: 3 }} />
        <Skeleton active paragraph={{ rows: 3 }} />
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {data.map((order, index) => (
        <div 
          key={index} 
          className="card radius-12 border shadow-sm" 
          style={{ marginBottom: "20px" }}  
        >
          {/* Card Header */}
          <div className="card-header py-16 px-24 bg-base d-flex align-items-center gap-1 justify-content-between border border-end-0 border-start-0 border-top-0">
            {/* Order Info */}
            <div className="flex flex-col md:flex-row md:gap-8 text-sm">
              <div>
                <div className="text-gray-500">Tanggal Pesan</div>
                <p className="fw-bold text-md">{order.tanggalOrder}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-8 text-sm">
              <div>
                <div className="">Total Pesananan</div>
                <p className="fw-bold text-md">Rp {order.totalOrder}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-8 text-sm">
              <div>
                <div className="text-gray-500">Nama Pemesan</div>
                <p className="fw-bold text-md">{order.nama}</p>
              </div>
            </div>

            {/* Order ID and Action Buttons */}
            <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
              <p className="text-gray-500 text-sm">
                Order: <span className="fw-bold text-md">{order.orderId}</span>
              </p>
              {order.status === 0 && (
              <Flex gap={5}>
                <Button color="red" variant="solid">Sudah Membayar</Button>
                <Button type="default" danger>Batalkan Pesanan</Button>
              </Flex>
              )}
              {order.status === 1 && (
                <Tag 
                  color="warning" 
                  icon={<SyncOutlined />} 
                >
                  Pesanan diproses
                </Tag>
              )}
              {order.status === 2 && (
                <div className="">
                  <Tag 
                  color="green" 
                  icon={<ShopOutlined />} 
                >
                  Pesanan selesai
                </Tag>
                <Button>
                  Ambil Pesanan
                </Button>   
              </div>
              )}
            </div>
          </div>

          {/* Notification */}
          <div className="card-body py-16 px-24 h-16">
            <p className="text-sm text-gray-500 mb-2">Antrian</p>
            <div 
              className="fw-bold" 
              style={{ fontSize: "40px", color: "#7C0000" }}
            >
              {order.antrian}
            </div>
            <Tag 
              color="volcano" 
              icon={<ShopOutlined />} 
            >
              {order.tipeOrder}
            </Tag>
          </div>

          {/* Card Body */}
          <div className="card-body py-16 px-24">
            {/* Order List */}
            <Collapse
              items={order.order.map((item, idx) => ({
                key: idx,
                label: `${item.namaMenu} x ${item.jumlah}`,
                extra: `Rp ${(item.jumlah * parseInt(item.harga)).toLocaleString("id-ID")}`,
                children: (
                  <>
                    <p className="text-sm fw-bold text-gray-500 mb-2">
                      <FormOutlined /> {item.note || "..."}
                    </p>
                    <div className="flex justify-between text-sm">
                      <p>{`${item.jumlah} x Rp ${parseInt(item.harga).toLocaleString("id-ID")}`}</p>
                      <p className="font-semibold">{`Rp ${(item.jumlah * parseInt(item.harga)).toLocaleString("id-ID")}`}</p>
                    </div>
                  </>
                ),
              }))}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCard;
