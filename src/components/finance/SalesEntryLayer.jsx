"use client";
// src/components/finance/SalesEntryLayer.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ConfigProvider, InputNumber, Input, Skeleton, Tag, message } from "antd";
import { Icon } from "@iconify/react/dist/iconify.js";
import { financeApi } from "@/lib/financeApi";
import VoidModal from "@/components/finance/VoidModal";
import {
  BRAND, CHANNEL_META, CHANNEL_ORDER, addDays, dayName, errMsg, fmtDate,
  moneyInputProps, num, rupiah, todayWIB,
} from "@/utils/financeFormat";

const HISTORY_DAYS = 14;
const EMPTY = { gross: null, orders: null };

const SalesEntryLayer = () => {
  const today = todayWIB();
  const [date, setDate] = useState(today);
  const [channels, setChannels] = useState([]);
  const [existing, setExisting] = useState({}); // code -> sale
  const [form, setForm] = useState({}); // code -> { gross, orders }
  const [history, setHistory] = useState([]); // trend 14 hari
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [voiding, setVoiding] = useState(null); // sale yang akan dibatalkan

  // Kanal (sekali)
  useEffect(() => {
    financeApi
      .channels()
      .then((list) =>
        setChannels(
          list
            .filter((c) => c.isActive)
            .sort((a, b) => CHANNEL_ORDER.indexOf(a.code) - CHANNEL_ORDER.indexOf(b.code))
        )
      )
      .catch((e) => setError(errMsg(e)));
  }, []);

  const loadDay = useCallback(async (d) => {
    setLoading(true);
    setError("");
    try {
      const sales = await financeApi.sales({ startDate: d, endDate: d });
      const map = {};
      const f = {};
      for (const s of sales) {
        map[s.channel.code] = s;
        f[s.channel.code] = { gross: Number(s.grossSales), orders: s.orderCount };
      }
      setExisting(map);
      setForm(f);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const s = await financeApi.salesSummary({
        startDate: addDays(todayWIB(), -(HISTORY_DAYS - 1)),
        endDate: todayWIB(),
      });
      setHistory(s.trend);
    } catch {
      /* riwayat hanya pelengkap */
    }
  }, []);

  useEffect(() => {
    loadDay(date);
  }, [date, loadDay]);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const setField = (code, key, value) =>
    setForm((prev) => ({ ...prev, [code]: { ...(prev[code] || EMPTY), [key]: value } }));

  const rowState = (code) => {
    const f = form[code] || EMPTY;
    const ex = existing[code];
    const filled = f.gross !== null && f.gross !== undefined;
    const changed = ex
      ? Number(ex.grossSales) !== Number(f.gross) || ex.orderCount !== Number(f.orders || 0)
      : filled;
    return { f, ex, filled, changed };
  };

  const rows = channels.map((c) => ({ c, ...rowState(c.code) }));
  const pending = rows.filter((r) => r.filled && r.changed);
  const totalGross = rows.reduce((a, r) => a + (r.filled ? Number(r.f.gross) : 0), 0);
  const totalFee = rows.reduce(
    (a, r) => a + (r.filled ? Number(r.f.gross) * Number(r.c.commissionRate) : 0),
    0
  );
  const totalOrders = rows.reduce((a, r) => a + (r.filled ? Number(r.f.orders || 0) : 0), 0);

  const save = async () => {
    if (pending.length === 0 || saving) return;
    setSaving(true);
    const results = await Promise.allSettled(
      pending.map((r) =>
        r.ex
          ? financeApi.updateSale(r.ex.id, {
              grossSales: Number(r.f.gross),
              orderCount: Number(r.f.orders || 0),
            })
          : financeApi.createSale({
              salesDate: date,
              channel: r.c.code,
              grossSales: Number(r.f.gross),
              orderCount: Number(r.f.orders || 0),
            })
      )
    );
    const failed = results
      .map((res, i) => (res.status === "rejected" ? `${pending[i].c.name}: ${errMsg(res.reason)}` : null))
      .filter(Boolean);
    const okCount = results.length - failed.length;

    if (okCount > 0) message.success(`${okCount} rekap tersimpan`);
    if (failed.length) message.error(failed.join(" | "), 6);

    await Promise.all([loadDay(date), loadHistory()]);
    setSaving(false);
  };

  const confirmVoid = async (reason) => {
    await financeApi.voidSale(voiding.id, reason);
    message.success("Rekap dibatalkan");
    await Promise.all([loadDay(date), loadHistory()]);
  };

  // 14 hari terakhir, hari tanpa rekap ditandai
  const historyRows = useMemo(() => {
    const byDate = Object.fromEntries(history.map((h) => [h.date, h]));
    return Array.from({ length: HISTORY_DAYS }, (_, i) => {
      const d = addDays(todayWIB(), -i);
      return { date: d, ...(byDate[d] || {}), recorded: !!byDate[d] };
    });
  }, [history]);
  const missingCount = historyRows.filter((h) => !h.recorded).length;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: BRAND } }}>
      <div className='row g-3'>
        <div className='col-12 col-xl-7'>
          <div className='card radius-12 border shadow-sm'>
            <div className='card-body p-16 p-md-24'>
              <div className='d-flex flex-wrap align-items-center gap-2 mb-16'>
                <h6 className='fw-semibold mb-0 me-auto'>Rekap Penjualan Harian</h6>
                <Button aria-label='Hari sebelumnya' icon={<Icon icon='mdi:chevron-left' />} onClick={() => setDate(addDays(date, -1))} />
                <Input
                  type='date'
                  value={date}
                  max={today}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  style={{ width: 160 }}
                />
                <Button aria-label='Hari berikutnya' icon={<Icon icon='mdi:chevron-right' />} disabled={date >= today} onClick={() => setDate(addDays(date, 1))} />
                {date !== today && <Button onClick={() => setDate(today)}>Hari ini</Button>}
              </div>

              <div className='text-secondary-light mb-16'>
                {dayName(date)}, {fmtDate(date)}
                {date === today && " (hari ini)"}
              </div>

              {error && <Alert type='error' showIcon message={error} className='mb-16' />}

              {loading && channels.length === 0 ? (
                <Skeleton active />
              ) : (
                <>
                  <div className='d-flex flex-column gap-3'>
                    {rows.map(({ c, f, ex, filled, changed }) => {
                      const meta = CHANNEL_META[c.code] || { icon: "mdi:cash", color: BRAND };
                      const fee = filled ? Number(f.gross) * Number(c.commissionRate) : 0;
                      return (
                        <div key={c.code} className='border radius-12 p-12' style={{ borderLeft: `6px solid ${meta.color}` }}>
                          <div className='d-flex align-items-center gap-2 mb-8'>
                            <Icon icon={meta.icon} style={{ fontSize: 22, color: meta.color }} />
                            <b>{c.name}</b>
                            {ex && !changed && <Tag color='success' className='ms-1'>Tersimpan</Tag>}
                            {ex && changed && <Tag color='warning' className='ms-1'>Belum disimpan</Tag>}
                            {!ex && filled && <Tag color='processing' className='ms-1'>Baru</Tag>}
                            {ex && (
                              <Button size='small' danger type='text' className='ms-auto' onClick={() => setVoiding({ ...ex, name: c.name })}>
                                Batalkan
                              </Button>
                            )}
                          </div>
                          <div className='row g-2'>
                            <div className='col-7'>
                              <InputNumber
                                {...moneyInputProps}
                                size='large'
                                addonBefore='Rp'
                                value={f.gross}
                                placeholder='Omzet kotor'
                                inputMode='numeric'
                                onChange={(v) => setField(c.code, "gross", v)}
                                disabled={loading}
                              />
                            </div>
                            <div className='col-5'>
                              <InputNumber
                                min={0}
                                precision={0}
                                size='large'
                                style={{ width: "100%" }}
                                value={f.orders}
                                placeholder='Jml order'
                                inputMode='numeric'
                                onChange={(v) => setField(c.code, "orders", v)}
                                disabled={loading}
                              />
                            </div>
                          </div>
                          {filled && Number(c.commissionRate) > 0 && (
                            <div className='text-secondary-light text-sm mt-8'>
                              Perkiraan komisi {Math.round(Number(c.commissionRate) * 100)}%: {rupiah(fee)} · diterima ± {rupiah(Number(f.gross) - fee)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className='d-flex flex-wrap align-items-center gap-3 mt-20 pt-16 border-top'>
                    <div className='me-auto'>
                      <div className='text-secondary-light text-sm'>Total hari ini</div>
                      <div className='fw-bold' style={{ fontSize: 22 }}>{rupiah(totalGross)}</div>
                      <div className='text-secondary-light text-sm'>
                        {num(totalOrders)} order · ± {rupiah(totalGross - totalFee)} setelah komisi
                      </div>
                    </div>
                    <Button type='primary' size='large' loading={saving} disabled={pending.length === 0} onClick={save}>
                      Simpan{pending.length > 0 ? ` (${pending.length})` : ""}
                    </Button>
                  </div>
                  <div className='text-secondary-light text-sm mt-8'>
                    Isi <b>0</b> untuk kanal yang tidak ada penjualan hari itu, supaya hari tersebut tercatat. Kolom kosong berarti belum direkap.
                    Angka komisi di atas hanya perkiraan; yang disimpan adalah hitungan server.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='col-12 col-xl-5'>
          <div className='card radius-12 border shadow-sm'>
            <div className='card-body p-16 p-md-24'>
              <div className='d-flex align-items-center mb-12'>
                <h6 className='fw-semibold mb-0 me-auto'>{HISTORY_DAYS} Hari Terakhir</h6>
                {missingCount > 0 && <Tag color='warning'>{missingCount} hari belum direkap</Tag>}
              </div>
              <div className='d-flex flex-column'>
                {historyRows.map((h) => (
                  <button
                    key={h.date}
                    type='button'
                    onClick={() => setDate(h.date)}
                    className='d-flex align-items-center gap-2 py-8 border-0 border-bottom bg-transparent text-start w-100'
                    style={{ background: h.date === date ? "#7C000010" : "transparent" }}
                  >
                    <span style={{ width: 92 }}>
                      {dayName(h.date)}, {fmtDate(h.date).slice(0, 5)}
                    </span>
                    {h.recorded ? (
                      <>
                        <b className='ms-auto'>{rupiah(h.grossSales)}</b>
                        <span className='text-secondary-light text-sm' style={{ width: 64, textAlign: "right" }}>
                          {num(h.orderCount)} order
                        </span>
                      </>
                    ) : (
                      <Tag color='warning' className='ms-auto me-0'>Belum direkap</Tag>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoidModal
        open={!!voiding}
        title={voiding ? `Batalkan rekap ${voiding.name}?` : ""}
        description={voiding ? `Rekap ${fmtDate(date)} sebesar ${rupiah(voiding.grossSales)} tidak akan dihitung di laporan.` : ""}
        onClose={() => setVoiding(null)}
        onConfirm={confirmVoid}
      />
    </ConfigProvider>
  );
};

export default SalesEntryLayer;