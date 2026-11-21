"use client";
// src/components/finance/FinanceQuickCard.jsx
// Ringkasan keuangan + tombol cepat, dipasang di dashboard utama (DashBoardLayer).
// Tombol navigasi SELALU tampil; kalau API keuangan gagal, hanya bagian angkanya yang diganti pesan.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Progress, Skeleton } from "antd";
import { Icon } from "@iconify/react/dist/iconify.js";
import { financeApi } from "@/lib/financeApi";
import { BRAND, dayName, errMsg, fmtDate, monthStart, rupiah, todayWIB } from "@/utils/financeFormat";

const ASSUMED_MARGIN = 0.35; // asumsi untuk target harian; sama dengan halaman Keuangan

const ActionLink = ({ href, icon, title, subtitle, solid }) => (
  <Link
    href={href}
    className='d-flex align-items-center gap-3 text-decoration-none w-100'
    style={{
      padding: "14px 18px",
      borderRadius: 14,
      minHeight: 78,
      background: solid ? BRAND : "transparent",
      color: solid ? "#fff" : BRAND,
      border: `2px solid ${BRAND}`,
    }}
  >
    <Icon icon={icon} style={{ fontSize: 34, flexShrink: 0 }} />
    <span className='d-flex flex-column'>
      <span className='fw-bold' style={{ fontSize: "clamp(16px, 4vw, 19px)" }}>{title}</span>
      <span style={{ fontSize: 13, opacity: 0.85 }}>{subtitle}</span>
    </span>
    <Icon icon='mdi:chevron-right' className='ms-auto' style={{ fontSize: 26, flexShrink: 0 }} />
  </Link>
);

const Stat = ({ label, value, tone }) => (
  <div className='border radius-12 p-12 h-100'>
    <div className='text-secondary-light text-sm mb-4'>{label}</div>
    <div
      className='fw-bold'
      style={{ fontSize: "clamp(16px, 3.6vw, 20px)", color: tone === "neg" ? "#dc2626" : "inherit" }}
    >
      {value}
    </div>
  </div>
);

const FinanceQuickCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const today = todayWIB();
      setData(
        await financeApi.dashboard({
          startDate: monthStart(today),
          endDate: today,
          marginRate: ASSUMED_MARGIN,
        })
      );
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat saat dibuka, dan segarkan saat kembali ke tab ini (mis. setelah mencatat penjualan)
  useEffect(() => {
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const today = todayWIB();
  const dt = data?.dailyTarget;
  const todayRecorded = data?.sales?.trend?.some((t) => t.date === today);
  const balance = Number(data?.balances?.business ?? 0);

  return (
    <div className='card radius-12 border shadow-sm'>
      <div className='card-body p-16 p-md-24'>
        <div className='d-flex align-items-center mb-12'>
          <h6 className='fw-semibold mb-0 me-auto'>Keuangan</h6>
          <span className='text-secondary-light text-sm me-12'>
            {dayName(today)}, {fmtDate(today)}
          </span>
          <Link href='/finance' className='text-sm fw-semibold' style={{ color: BRAND }}>
            Laporan lengkap →
          </Link>
        </div>

        <div className='row g-3 mb-16'>
          <div className='col-12 col-md-6'>
            <ActionLink href='/finance-sales' icon='mdi:cash-plus' title='Catat Penjualan' subtitle='Rekap harian Shopee, Gojek, Grab, Offline' solid />
          </div>
          <div className='col-12 col-md-6'>
            <ActionLink href='/finance-expenses' icon='mdi:cart-arrow-up' title='Catat Pengeluaran' subtitle='Belanja, gaji pemilik, transfer' />
          </div>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        ) : error ? (
          <div className='d-flex align-items-center gap-2 text-secondary-light'>
            <Icon icon='mdi:cloud-off-outline' style={{ fontSize: 20 }} />
            <span className='me-auto'>Ringkasan keuangan belum bisa dimuat: {error}</span>
            <Button size='small' onClick={load}>Coba lagi</Button>
          </div>
        ) : data ? (
          <>
            {!todayRecorded && (
              <Link
                href='/finance-sales'
                className='d-flex align-items-center gap-2 text-decoration-none mb-12 px-12 py-8 radius-8'
                style={{ background: "#fff7e6", border: "1px solid #ffd591", color: "#ad6800" }}
              >
                <Icon icon='mdi:alert-circle-outline' style={{ fontSize: 20 }} />
                Penjualan hari ini belum direkap. Ketuk untuk mengisi.
              </Link>
            )}

            <div className='row g-2 mb-12'>
              <div className='col-6 col-md-3'>
                <Stat label='Omzet hari ini' value={rupiah(dt?.todayGrossSales ?? 0)} />
              </div>
              <div className='col-6 col-md-3'>
                <Stat label='Omzet bulan ini' value={rupiah(data.sales.total.grossSales)} />
              </div>
              <div className='col-6 col-md-3'>
                <Stat label='Pengeluaran usaha (bulan ini)' value={rupiah(data.expenses.business.total)} />
              </div>
              <div className='col-6 col-md-3'>
                <Stat label='Saldo usaha' value={rupiah(balance)} tone={balance < 0 ? "neg" : undefined} />
              </div>
            </div>

            {dt && (
              <div>
                <div className='d-flex flex-wrap justify-content-between text-sm mb-4'>
                  <span>
                    Target harian <b>{rupiah(dt.breakEvenRevenuePerDay)}</b>
                    <span className='text-secondary-light'> (asumsi margin {Math.round(dt.assumedMarginRate * 100)}%)</span>
                  </span>
                  <b style={{ color: dt.status === "AMAN" ? "#16a34a" : "#dc2626" }}>
                    {dt.status === "AMAN" ? "Aman" : "Belum tercapai"}
                  </b>
                </div>
                <Progress
                  percent={Math.min(100, Number(dt.progressPercent))}
                  showInfo={false}
                  strokeColor={dt.status === "AMAN" ? "#16a34a" : BRAND}
                  size='small'
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default FinanceQuickCard;