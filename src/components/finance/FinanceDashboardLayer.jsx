"use client";
// src/components/finance/FinanceDashboardLayer.jsx
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Alert, Button, ConfigProvider, Empty, Input, InputNumber, Progress, Skeleton, Table, Tag } from "antd";
import { Icon } from "@iconify/react/dist/iconify.js";
import { financeApi } from "@/lib/financeApi";
import {
  BRAND, CHANNEL_META, addDays, compact, errMsg, fmtShort, monthStart, num, rupiah, todayWIB,
} from "@/utils/financeFormat";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const StatCard = ({ title, value, sub, tone = "neutral", icon }) => {
  const color = tone === "pos" ? "#16a34a" : tone === "neg" ? "#dc2626" : "inherit";
  return (
    <div className='card radius-12 border shadow-sm h-100'>
      <div className='card-body p-16'>
        <div className='d-flex align-items-center gap-2 text-secondary-light text-sm mb-4'>
          {icon && <Icon icon={icon} style={{ fontSize: 18 }} />}
          {title}
        </div>
        <div className='fw-bold' style={{ fontSize: "clamp(18px, 2.2vw, 26px)", color }}>{value}</div>
        {sub && <div className='text-secondary-light text-sm mt-4'>{sub}</div>}
      </div>
    </div>
  );
};

const FinanceDashboardLayer = () => {
  const today = todayWIB();
  const [range, setRange] = useState({ start: monthStart(), end: today });
  const [marginInput, setMarginInput] = useState(35); // persen, asumsi
  const [margin, setMargin] = useState(35);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // tunda sebentar agar tidak menembak API setiap ketikan
  useEffect(() => {
    const t = setTimeout(() => marginInput && setMargin(marginInput), 600);
    return () => clearTimeout(t);
  }, [marginInput]);

  useEffect(() => {
    if (!range.start || !range.end || range.start > range.end) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    financeApi
      .dashboard({ startDate: range.start, endDate: range.end, marginRate: margin / 100 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errMsg(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range, margin]);

  const quick = [
    { label: "Hari ini", start: today, end: today },
    { label: "7 hari", start: addDays(today, -6), end: today },
    { label: "30 hari", start: addDays(today, -29), end: today },
    { label: "Bulan ini", start: monthStart(), end: today },
  ];

  const sales = data?.sales;
  const total = sales?.total;
  const hasSales = sales && sales.daysWithData > 0;
  const bizExpense = Number(data?.expenses?.business?.total || 0);
  const operating = Number(data?.operatingResult?.value || 0);
  const afterOwner = Number(data?.operatingResult?.afterOwnerPay || 0);
  const dt = data?.dailyTarget;

  const chart = useMemo(() => {
    const trend = sales?.trend || [];
    return {
      series: [{ name: "Omzet kotor", data: trend.map((t) => Number(t.grossSales)) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: [BRAND],
        plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
        dataLabels: { enabled: false },
        grid: { strokeDashArray: 3 },
        xaxis: { categories: trend.map((t) => fmtShort(t.date)), labels: { rotate: -45 } },
        yaxis: { labels: { formatter: (v) => compact(v) } },
        tooltip: { y: { formatter: (v) => rupiah(v) } },
      },
    };
  }, [sales]);

  const channelRows = (sales?.byChannel || []).map((c) => ({
    ...c,
    share: Number(total?.grossSales) > 0 ? (Number(c.grossSales) / Number(total.grossSales)) * 100 : 0,
  }));

  const channelColumns = [
    {
      title: "Kanal", dataIndex: "name",
      render: (v, r) => (
        <span className='d-inline-flex align-items-center gap-2'>
          <Icon icon={(CHANNEL_META[r.code] || {}).icon || "mdi:cash"} style={{ color: (CHANNEL_META[r.code] || {}).color }} />
          {v}
        </span>
      ),
    },
    { title: "Omzet", dataIndex: "grossSales", align: "right", render: rupiah },
    { title: "Komisi", dataIndex: "platformFee", align: "right", render: rupiah },
    { title: "Diterima", dataIndex: "netReceivable", align: "right", render: rupiah },
    { title: "Order", dataIndex: "orderCount", align: "right", render: num },
    { title: "Rata² order", dataIndex: "averageOrderValue", align: "right", render: (v) => (v ? rupiah(v) : "-") },
    { title: "Porsi", dataIndex: "share", align: "right", render: (v) => `${v.toFixed(0)}%` },
  ];

  const expenseColumns = [
    { title: "Kategori", dataIndex: "name" },
    { title: "Total", dataIndex: "total", align: "right", render: rupiah },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: BRAND } }}>
      {/* Filter periode */}
      <div className='card radius-12 border shadow-sm mb-16'>
        <div className='card-body p-16'>
          <div className='d-flex flex-wrap align-items-center gap-2'>
            <Input type='date' value={range.start} max={range.end} onChange={(e) => e.target.value && setRange((r) => ({ ...r, start: e.target.value }))} style={{ width: 160 }} />
            <span>s/d</span>
            <Input type='date' value={range.end} min={range.start} max={today} onChange={(e) => e.target.value && setRange((r) => ({ ...r, end: e.target.value }))} style={{ width: 160 }} />
            {quick.map((q) => (
              <Button key={q.label} size='small' type={range.start === q.start && range.end === q.end ? "primary" : "default"} onClick={() => setRange({ start: q.start, end: q.end })}>
                {q.label}
              </Button>
            ))}
            <div className='ms-auto d-flex align-items-center gap-2'>
              <span className='text-secondary-light text-sm'>Asumsi margin bersih</span>
              <InputNumber min={5} max={95} precision={0} value={marginInput} onChange={setMarginInput} addonAfter='%' style={{ width: 110 }} />
            </div>
          </div>
        </div>
      </div>

      {error && <Alert type='error' showIcon message={error} className='mb-16' />}

      {loading && !data ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : data ? (
        <>
          <div className='row g-3 mb-16'>
            <div className='col-6 col-lg-4 col-xxl-2'>
              <StatCard icon='mdi:cash-multiple' title='Omzet kotor' value={rupiah(total.grossSales)} sub={`${num(total.orderCount)} order · ${sales.daysWithData} hari terekap`} />
            </div>
            <div className='col-6 col-lg-4 col-xxl-2'>
              <StatCard icon='mdi:cash-check' title='Diterima' value={rupiah(total.netReceivable)} sub={`Komisi ${rupiah(total.platformFee)}`} />
            </div>
            <div className='col-6 col-lg-4 col-xxl-2'>
              <StatCard icon='mdi:cart-arrow-up' title='Pengeluaran usaha' value={rupiah(bizExpense)} tone='neg' />
            </div>
            <div className='col-6 col-lg-4 col-xxl-2'>
              <StatCard
                icon='mdi:scale-balance'
                title='Hasil usaha (kas)'
                value={rupiah(operating)}
                tone={operating >= 0 ? "pos" : "neg"}
                sub={`Setelah gaji pemilik ${rupiah(afterOwner)}`}
              />
            </div>
            <div className='col-6 col-lg-4 col-xxl-2'>
              <StatCard icon='mdi:storefront-outline' title='Saldo usaha' value={rupiah(data.balances.business)} />
            </div>
            <div className='col-6 col-lg-4 col-xxl-2'>
              <StatCard icon='mdi:home-outline' title='Saldo keluarga' value={rupiah(data.balances.family)} />
            </div>
          </div>

          <div className='alert alert-light border text-sm mb-16' role='note'>
            <b>Hasil usaha</b> = penjualan setelah komisi dikurangi pengeluaran usaha. Ini <b>bukan laba</b>: belanja bahan yang belum terpakai ikut terhitung,
            dan HPP per menu belum diisi. Laba akan ditampilkan setelah HPP tersedia.
          </div>

          <div className='row g-3 mb-16'>
            <div className='col-12 col-xl-5'>
              <div className='card radius-12 border shadow-sm h-100'>
                <div className='card-body p-16 p-md-24'>
                  <div className='d-flex align-items-center mb-12'>
                    <h6 className='fw-semibold mb-0 me-auto'>Target Harian</h6>
                    {dt && <Tag color={dt.status === "AMAN" ? "success" : "error"}>{dt.status === "AMAN" ? "Aman" : "Belum tercapai"}</Tag>}
                  </div>
                  {dt ? (
                    <>
                      <div className='text-secondary-light text-sm'>Omzet kotor hari ini</div>
                      <div className='fw-bold mb-8' style={{ fontSize: 24 }}>{rupiah(dt.todayGrossSales)}</div>
                      <Progress
                        percent={Math.min(100, Number(dt.progressPercent))}
                        status={dt.status === "AMAN" ? "success" : "active"}
                        format={() => `${dt.progressPercent}%`}
                      />
                      <div className='mt-8'>
                        Titik impas harian: <b>{rupiah(dt.breakEvenRevenuePerDay)}</b>
                      </div>
                      <div className='text-secondary-light text-sm'>
                        Untuk menutup kewajiban {rupiah(dt.requiredProfitPerDay)} per hari pada margin {Math.round(dt.assumedMarginRate * 100)}%.
                      </div>
                      <div className='text-secondary-light text-sm mt-8'>{dt.note}</div>
                    </>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Isi asumsi margin untuk melihat target' />
                  )}
                  <div className='border-top mt-16 pt-12 text-sm'>
                    <div className='d-flex justify-content-between'><span>Kewajiban bulanan (total)</span><b>{rupiah(data.obligations.all.monthly)}</b></div>
                    <div className='d-flex justify-content-between'><span>· Usaha</span><span>{rupiah(data.obligations.business.monthly)}</span></div>
                    <div className='d-flex justify-content-between'><span>· Keluarga</span><span>{rupiah(data.obligations.family.monthly)}</span></div>
                    <div className='d-flex justify-content-between'><span>Sisihkan per hari</span><b>{rupiah(data.obligations.all.dailyReserve)}</b></div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-12 col-xl-7'>
              <div className='card radius-12 border shadow-sm h-100'>
                <div className='card-body p-16 p-md-24'>
                  <h6 className='fw-semibold mb-12'>Tren Omzet Harian</h6>
                  {hasSales ? (
                    <ReactApexChart options={chart.options} series={chart.series} type='bar' height={300} />
                  ) : (
                    <Empty description='Belum ada rekap penjualan pada periode ini'>
                      <Link href='/finance-sales'><Button type='primary'>Isi rekap penjualan</Button></Link>
                    </Empty>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='card radius-12 border shadow-sm mb-16'>
            <div className='card-body p-16 p-md-24'>
              <h6 className='fw-semibold mb-12'>Per Kanal</h6>
              <Table size='small' rowKey='code' pagination={false} columns={channelColumns} dataSource={channelRows} scroll={{ x: 640 }} locale={{ emptyText: "Belum ada data" }} />
              {sales.averageGrossPerDay && (
                <div className='text-secondary-light text-sm mt-8'>Rata-rata omzet per hari terekap: {rupiah(sales.averageGrossPerDay)}</div>
              )}
            </div>
          </div>

          <div className='row g-3'>
            <div className='col-12 col-lg-6'>
              <div className='card radius-12 border shadow-sm h-100'>
                <div className='card-body p-16 p-md-24'>
                  <h6 className='fw-semibold mb-12'>Pengeluaran Usaha · {rupiah(data.expenses.business.total)}</h6>
                  <Table size='small' rowKey='name' pagination={false} columns={expenseColumns} dataSource={data.expenses.business.byCategory} locale={{ emptyText: "Belum ada pengeluaran" }} />
                </div>
              </div>
            </div>
            <div className='col-12 col-lg-6'>
              <div className='card radius-12 border shadow-sm h-100'>
                <div className='card-body p-16 p-md-24'>
                  <h6 className='fw-semibold mb-12'>Pengeluaran Keluarga · {rupiah(data.expenses.family.total)}</h6>
                  <Table size='small' rowKey='name' pagination={false} columns={expenseColumns} dataSource={data.expenses.family.byCategory} locale={{ emptyText: "Belum ada pengeluaran" }} />
                  <div className='text-secondary-light text-sm mt-8'>Gaji pemilik pada periode ini: <b>{rupiah(data.ownerPay)}</b></div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </ConfigProvider>
  );
};

export default FinanceDashboardLayer;