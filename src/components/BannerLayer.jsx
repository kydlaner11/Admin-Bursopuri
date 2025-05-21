"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Table, Button, Skeleton, message, Popconfirm, Image } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Api from "../api";

const BannerLayer = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const response = await Api.get("/bursopuri/carousel");
        setBanners(response.data.carousel);
      } catch (error) {
        console.error("Error fetching banners:", error);
        messageApi.error("Gagal memuat banner.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    try {
      await Api.delete(`bursopuri/carousel/${id}`);
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
      messageApi.success("Banner berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting banner:", error);
      messageApi.error("Gagal menghapus banner.");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Gambar",
      dataIndex: "banner",
      key: "banner",
      render: (text) => <Image src={text} alt="Banner" width={100} />,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Hapus Banner"
            description="Apakah Anda yakin ingin menghapus banner ini?"
            onConfirm={() => handleDelete(record.id)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type="link"
              icon={<Icon icon="lucide:delete" />}
              className="text-danger-main"
            >
              Hapus
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="card">
      {contextHolder}
      <div className="card-header d-flex flex-column align-items-end">
        <Link
          href="banner-add"
          className={`btn btn-sm btn-primary-600${banners.length >= 3 ? " disabled" : ""}`}
          tabIndex={banners.length >= 3 ? -1 : 0}
          aria-disabled={banners.length >= 3}
          onClick={e => {
            if (banners.length >= 3) {
              e.preventDefault();
              messageApi.info("Maksimal 3 banner.");
            }
          }}
        >
          <i className='ri-add-line' /> Tambah Menu
        </Link>
        {banners.length >= 3 && (
          <div className="text mt-2" style={{ fontSize: 13 }}>
            Maksimal 3 banner.
          </div>
        )}
      </div>
      <div className="card-body">
        {loading ? (
          <Skeleton active />
        ) : (
          <Table
            columns={columns}
            dataSource={banners}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        )}
      </div>
    </div>
  );
};

export default BannerLayer;
