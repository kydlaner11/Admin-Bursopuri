"use client";

import { useEffect, useState, useRef } from "react";
import { Button, Flex, Tag, Row, Col, Collapse, Skeleton, message, Empty, Spin } from "antd";
import { ShopOutlined, FormOutlined, SyncOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Api from "@/api"; 
import { formatToIDRCurrency } from "@/utils/formatCurrency";

const OrderCard = () => {
  const [data, setData] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [doneLoading, setDoneLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);


  const fetchData = async () => {
    try {
      const response = await Api.get('bursopuri/order-progress', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const responseData = response.data.data;
      setData(responseData);
      console.log('Order successfully placed:', responseData);
    } catch (error) {
      console.error('Error fetching order data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const startCountdown = () => {
  //   let time = 15 * 60; // 15 minutes in seconds
  //   setCountdown(time);

  //   timerRef.current = setInterval(() => {
  //     time -= 1;
  //     setCountdown(time);

  //     if (time <= 0) {
  //       clearInterval(timerRef.current);
  //       setCountdown(0);
  //     }
  //   }, 1000);
  // };

  // const formatTime = (seconds) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  // };

  const handleDone = async (orderId) => {
    setDoneLoading(true);
    setProcessingOrderId(orderId);
    try {
      const response = await Api.put(`bursopuri/order-status/${orderId}`, {
        action: 'progress_to_done',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      message.success('Pesanan berhasil diselesaikan');
      console.log('Order completed for order:', orderId, response.data);
      await fetchData(); // Refresh data after confirming payment
    } catch (error) {
      console.error('Error completing order:', error);
      message.error('Gagal menyelesaikan pesanan');
    } finally {
      setDoneLoading(false);
      setProcessingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-16">
        <div className="card radius-12 border shadow-sm">
          <div className="card-header py-16 px-24">
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
          <div className="card-body py-16 px-24">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        </div>
        <div className="card radius-12 border shadow-sm">
          <div className="card-header py-16 px-24">
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
          <div className="card-body py-16 px-24">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        </div>
        <div className="card radius-12 border shadow-sm">
          <div className="card-header py-16 px-24">
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
          <div className="card-body py-16 px-24">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        </div>
      </div>
    );
  }

    if (data.length === 0) {
    return (
      <Empty
        description="Tidak ada data pesanan"
      />
    );
  }

  

  return (
    <div className="flex flex-col">
      <Spin 
        spinning={doneLoading} 
        size="large"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: doneLoading ? '200px' : 'auto'
        }}
      >
        {data.map((order, index) => (
          <div 
            key={index} 
            className="card radius-12 border shadow-sm" 
            style={{ 
              marginBottom: "20px",
              opacity: doneLoading && processingOrderId === order.orderId ? 0.7 : 1
            }}  
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
                <p className="fw-bold text-md">{formatToIDRCurrency(order.totalOrder)}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-8 text-sm">
              <div>
                <div className="text-gray-500">Nama Pemesan</div>
                <p className="fw-bold text-md">{order.nama}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-8 text-sm">
              <div>
                <div className="text-gray-500">No. Meja</div>
                <p className="fw-bold text-md">{order.tableNumber}</p>
              </div>
            </div>

            {/* Order ID and Action Buttons */}
            <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
              <p className="text-gray-500 text-sm">
                Order: <span className="fw-bold text-md">{order.orderId}</span>
              </p>
              {order.status === "IN_PROGRESS" && (
                <Flex gap={5}>
                  <Tag 
                    color="warning" 
                    icon={<SyncOutlined />} 
                    style={{ display: "flex", alignItems: "center" }} 
                  >
                    Pesanan diproses
                  </Tag>                    <div className="">
                      <Button 
                        color="red" 
                        variant="solid"
                        onClick={() => handleDone(order.orderId)}
                        loading={doneLoading && processingOrderId === order.orderId}
                      >
                        Pesanan Selesai
                      </Button>
                    </div>
                </Flex>
                
              )}
              {order.status === "DONE" && (
                <Flex gap={5} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Tag 
                    color="success" 
                    icon={<CheckCircleOutlined />} 
                    style={{ display: "flex", alignItems: "center" }} 
                  >
                    Pesanan Selesai
                  </Tag>
              </Flex>
              )}
            </div>
          </div>

          <div className=" flex-row" style={{ display: "flex" }}>
            {/* Notification */}
            <div className="card-body py-16 px-24 h-16" style={{ maxWidth:" 250px" }}>
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
                  extra: formatToIDRCurrency(item.jumlah * parseInt(item.harga)),
                  children: (
                    <>
                      {item.note && (
                        <Tag
                          icon={<FormOutlined />} 
                          color="#FFF7E6"
                          className="mb-8"
                          style={{
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#FF8C00',
                            background: '#FFF7E6',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            width: '30%',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                          }}
                        >
                          {item.note}
                        </Tag>
                      )}
                      {item.options && item.options.length > 0 && (
                        <div className="mb-2 text-sm">
                          <ul className="list-disc list-inside">
                            {item.options.map((opt, i) => (
                              <li key={i}>
                                <span className="font-medium" style={{ color: "GrayText" }}>{opt.optionName}</span>: {opt.choiceName}
                              </li>
                            ))}
                          </ul>
                          {(() => {
                            const totalOptionsPrice = item.options.reduce((sum, opt) => {
                              if (!opt.choicePrice) return sum;
                              
                              // Handle case where choicePrice is a comma-separated string
                              if (typeof opt.choicePrice === 'string' && opt.choicePrice.includes(',')) {
                                const prices = opt.choicePrice.split(',').map(price => parseInt(price.trim()) || 0);
                                return sum + prices.reduce((priceSum, price) => priceSum + price, 0);
                              }
                              
                              // Handle single price
                              return sum + parseInt(opt.choicePrice || 0);
                            }, 0);
                            
                            return totalOptionsPrice > 0 && (
                              <div className="text-sm font-medium mt-1">
                                Harga Tambahan: <span style={{ fontWeight: 600 }}>+{formatToIDRCurrency(totalOptionsPrice)}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* <div className="flex justify-between text-sm">
                        <p>{`${item.jumlah} x ${formatToIDRCurrency(parseInt(item.harga))}`}</p>
                        <p className="font-semibold">{formatToIDRCurrency(item.jumlah * parseInt(item.harga))}</p>
                      </div> */}
                    </>
                  ),
                }))}
              />
            </div>
          </div>
        </div>  
        ))}
      </Spin>
    </div>
  );
};

export default OrderCard;
