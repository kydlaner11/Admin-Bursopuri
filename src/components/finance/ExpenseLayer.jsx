"use client";
// src/components/finance/ExpenseLayer.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ConfigProvider, Input, InputNumber, Segmented, Select, Switch, Table, Tabs, Tag, message } from "antd";
import { financeApi } from "@/lib/financeApi";
import VoidModal from "@/components/finance/VoidModal";
import {
  BRAND, WALLET_LABEL, errMsg, fmtDate, monthStart, moneyInputProps, newKey, rupiah, todayWIB,
} from "@/utils/financeFormat";

const Field = ({ label, children }) => (
  <div className='mb-16'>
    <div className='text-secondary-light text-sm mb-4'>{label}</div>
    {children}
  </div>
);

const accountLabel = (a) => `${a.name} · ${WALLET_LABEL[a.wallet]} · ${rupiah(a.balance)}`;

// Filter periode untuk daftar di tiap tab
const RangeBar = ({ range, setRange, extra }) => (
  <div className='d-flex flex-wrap align-items-center gap-2 mb-12'>
    <Input type='date' size='small' value={range.start} max={range.end} onChange={(e) => e.target.value && setRange((r) => ({ ...r, start: e.target.value }))} style={{ width: 150 }} />
    <span>s/d</span>
    <Input type='date' size='small' value={range.end} min={range.start} max={todayWIB()} onChange={(e) => e.target.value && setRange((r) => ({ ...r, end: e.target.value }))} style={{ width: 150 }} />
    {extra}
  </div>
);

const useRange = () => {
  const [range, setRange] = useState({ start: monthStart(), end: todayWIB() });
  return [range, setRange];
};

// -------------------------------------------------------------- PENGELUARAN
const ExpenseTab = ({ accounts, categories, reload }) => {
  const [wallet, setWallet] = useState("BUSINESS");
  const [accountId, setAccountId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [date, setDate] = useState(todayWIB());
  const [description, setDescription] = useState("");
  const [key, setKey] = useState(newKey());
  const [submitting, setSubmitting] = useState(false);

  const [range, setRange] = useRange();
  const [listWallet, setListWallet] = useState("ALL");
  const [list, setList] = useState({ total: "0", items: [] });
  const [loading, setLoading] = useState(false);
  const [voiding, setVoiding] = useState(null);

  const accountOptions = accounts.filter((a) => a.wallet === wallet);
  const categoryOptions = categories.filter((c) => c.wallet === wallet);

  useEffect(() => {
    if (!accountOptions.some((a) => a.id === accountId)) setAccountId(accountOptions[0]?.id ?? null);
  }, [accounts, wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadList = useCallback(async () => {
    if (range.start > range.end) return;
    setLoading(true);
    try {
      setList(
        await financeApi.expenses({
          startDate: range.start,
          endDate: range.end,
          wallet: listWallet === "ALL" ? undefined : listWallet,
        })
      );
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [range, listWallet]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const changeWallet = (w) => {
    setWallet(w);
    setCategoryId(null);
  };

  const submit = async () => {
    if (!accountId || !categoryId || !amount || !date) {
      message.warning("Lengkapi akun, kategori, tanggal, dan nominal");
      return;
    }
    setSubmitting(true);
    try {
      const r = await financeApi.createExpense({
        accountId,
        categoryId,
        amount: Number(amount),
        transactionDate: date,
        description: description.trim() || undefined,
        idempotencyKey: key,
      });
      message.success(r.replayed ? "Pengeluaran ini sudah tersimpan sebelumnya" : `Tersimpan. Saldo akun: ${rupiah(r.balance)}`);
      (r.warnings || []).forEach((w) => message.warning(w, 5));
      setAmount(null);
      setDescription("");
      setKey(newKey()); // kunci baru hanya setelah berhasil; kalau gagal, kunci sama aman dicoba ulang
      await Promise.all([reload(), loadList()]);
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "Tanggal", dataIndex: "transactionDate", render: fmtDate, width: 100 },
    { title: "Kategori", render: (_, r) => r.category?.name || "-" },
    { title: "Akun", render: (_, r) => <>{r.account.name} <Tag>{WALLET_LABEL[r.account.wallet]}</Tag></> },
    { title: "Keterangan", dataIndex: "description", ellipsis: true, render: (v) => v || "-" },
    { title: "Nominal", dataIndex: "amount", align: "right", render: rupiah },
    { title: "", width: 90, render: (_, r) => <Button size='small' danger type='text' onClick={() => setVoiding(r)}>Batalkan</Button> },
  ];

  return (
    <div className='row g-3'>
      <div className='col-12 col-xl-4'>
        <div className='card radius-12 border shadow-sm'>
          <div className='card-body p-16 p-md-24'>
            <h6 className='fw-semibold mb-16'>Catat Pengeluaran</h6>
            <Field label='Dompet'>
              <Segmented block value={wallet} onChange={changeWallet} options={[{ label: "Usaha", value: "BUSINESS" }, { label: "Keluarga", value: "FAMILY" }]} />
            </Field>
            <Field label='Dibayar dari akun'>
              <Select style={{ width: "100%" }} value={accountId} onChange={setAccountId} options={accountOptions.map((a) => ({ value: a.id, label: accountLabel(a) }))} placeholder='Pilih akun' />
            </Field>
            <Field label='Kategori'>
              <Select style={{ width: "100%" }} showSearch optionFilterProp='label' value={categoryId} onChange={setCategoryId} options={categoryOptions.map((c) => ({ value: c.id, label: c.name }))} placeholder='Pilih kategori' />
            </Field>
            <Field label='Nominal'>
              <InputNumber {...moneyInputProps} size='large' addonBefore='Rp' inputMode='numeric' value={amount} onChange={setAmount} placeholder='0' />
            </Field>
            <Field label='Tanggal'>
              <Input type='date' value={date} max={todayWIB()} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </Field>
            <Field label='Keterangan (opsional)'>
              <Input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} placeholder='mis. Ayam 5 kg di pasar' />
            </Field>
            <Button type='primary' size='large' block loading={submitting} onClick={submit}>Simpan Pengeluaran</Button>
            <div className='text-secondary-light text-sm mt-8'>Kategori mengikuti dompet. Uang keluarga tidak boleh dibayar dari akun usaha, dan sebaliknya.</div>
          </div>
        </div>
      </div>

      <div className='col-12 col-xl-8'>
        <div className='card radius-12 border shadow-sm'>
          <div className='card-body p-16 p-md-24'>
            <div className='d-flex align-items-center mb-12'>
              <h6 className='fw-semibold mb-0 me-auto'>Riwayat Pengeluaran</h6>
              <b>{rupiah(list.total)}</b>
            </div>
            <RangeBar
              range={range}
              setRange={setRange}
              extra={<Segmented size='small' value={listWallet} onChange={setListWallet} options={[{ label: "Semua", value: "ALL" }, { label: "Usaha", value: "BUSINESS" }, { label: "Keluarga", value: "FAMILY" }]} />}
            />
            <Table size='small' rowKey='id' loading={loading} columns={columns} dataSource={list.items} pagination={{ pageSize: 15, hideOnSinglePage: true }} scroll={{ x: 640 }} locale={{ emptyText: "Belum ada pengeluaran pada periode ini" }} />
          </div>
        </div>
      </div>

      <VoidModal
        open={!!voiding}
        title='Batalkan pengeluaran?'
        description={voiding ? `${voiding.category?.name || "Pengeluaran"} ${rupiah(voiding.amount)} tanggal ${fmtDate(voiding.transactionDate)} akan dikeluarkan dari laporan dan saldo.` : ""}
        onClose={() => setVoiding(null)}
        onConfirm={async (reason) => {
          await financeApi.voidTransaction(voiding.id, reason);
          message.success("Pengeluaran dibatalkan");
          await Promise.all([reload(), loadList()]);
        }}
      />
    </div>
  );
};

// ----------------------------------------------------- TRANSFER / GAJI PEMILIK
const TransferTab = ({ accounts, reload }) => {
  const [fromId, setFromId] = useState(null);
  const [toId, setToId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [date, setDate] = useState(todayWIB());
  const [isOwnerPay, setIsOwnerPay] = useState(true);
  const [description, setDescription] = useState("");
  const [key, setKey] = useState(newKey());
  const [submitting, setSubmitting] = useState(false);

  const [range, setRange] = useRange();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voiding, setVoiding] = useState(null);

  useEffect(() => {
    if (!fromId) setFromId(accounts.find((a) => a.wallet === "BUSINESS")?.id ?? null);
    if (!toId) setToId(accounts.find((a) => a.wallet === "FAMILY")?.id ?? null);
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadList = useCallback(async () => {
    if (range.start > range.end) return;
    setLoading(true);
    try {
      setList(await financeApi.transfers({ startDate: range.start, endDate: range.end }));
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  const ownerPayInvalid = isOwnerPay && from && to && !(from.wallet === "BUSINESS" && to.wallet === "FAMILY");

  const submit = async () => {
    if (!fromId || !toId || !amount || !date) {
      message.warning("Lengkapi akun asal, tujuan, tanggal, dan nominal");
      return;
    }
    if (fromId === toId) {
      message.warning("Akun asal dan tujuan tidak boleh sama");
      return;
    }
    if (ownerPayInvalid) {
      message.warning("Gaji pemilik harus dari akun usaha ke akun keluarga");
      return;
    }
    setSubmitting(true);
    try {
      const r = await financeApi.createTransfer({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: Number(amount),
        transactionDate: date,
        isOwnerPay,
        description: description.trim() || undefined,
        idempotencyKey: key,
      });
      message.success(r.replayed ? "Transfer ini sudah tersimpan sebelumnya" : "Transfer tersimpan");
      (r.warnings || []).forEach((w) => message.warning(w, 5));
      setAmount(null);
      setDescription("");
      setKey(newKey());
      await Promise.all([reload(), loadList()]);
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const options = accounts.map((a) => ({ value: a.id, label: accountLabel(a) }));
  const columns = [
    { title: "Tanggal", dataIndex: "transactionDate", render: fmtDate, width: 100 },
    { title: "Dari → Ke", render: (_, r) => `${r.from.name} → ${r.to.name}` },
    { title: "", dataIndex: "isOwnerPay", width: 110, render: (v) => (v ? <Tag color='gold'>Gaji pemilik</Tag> : null) },
    { title: "Nominal", dataIndex: "amount", align: "right", render: rupiah },
    { title: "", width: 90, render: (_, r) => <Button size='small' danger type='text' onClick={() => setVoiding(r)}>Batalkan</Button> },
  ];

  return (
    <div className='row g-3'>
      <div className='col-12 col-xl-4'>
        <div className='card radius-12 border shadow-sm'>
          <div className='card-body p-16 p-md-24'>
            <h6 className='fw-semibold mb-16'>Transfer / Gaji Pemilik</h6>
            <Field label='Dari akun'>
              <Select style={{ width: "100%" }} value={fromId} onChange={setFromId} options={options} />
            </Field>
            <Field label='Ke akun'>
              <Select style={{ width: "100%" }} value={toId} onChange={setToId} options={options} />
            </Field>
            <Field label='Nominal'>
              <InputNumber {...moneyInputProps} size='large' addonBefore='Rp' inputMode='numeric' value={amount} onChange={setAmount} placeholder='0' />
            </Field>
            <Field label='Tanggal'>
              <Input type='date' value={date} max={todayWIB()} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </Field>
            <Field label='Keterangan (opsional)'>
              <Input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className='d-flex align-items-center gap-2 mb-16'>
              <Switch checked={isOwnerPay} onChange={setIsOwnerPay} />
              <span>Ini gaji pemilik (usaha → keluarga)</span>
            </div>
            {ownerPayInvalid && <Alert type='warning' showIcon className='mb-16' message='Gaji pemilik harus dari akun usaha ke akun keluarga. Matikan saklar jika ini transfer biasa.' />}
            <Button type='primary' size='large' block loading={submitting} onClick={submit}>Simpan Transfer</Button>
            <div className='text-secondary-light text-sm mt-8'>
              Tarik gaji dengan jumlah tetap dan teratur. Selisih antara hasil usaha dan gaji itulah yang menunjukkan apakah usaha menopang keluarga atau sebaliknya.
            </div>
          </div>
        </div>
      </div>

      <div className='col-12 col-xl-8'>
        <div className='card radius-12 border shadow-sm'>
          <div className='card-body p-16 p-md-24'>
            <h6 className='fw-semibold mb-12'>Riwayat Transfer</h6>
            <RangeBar range={range} setRange={setRange} />
            <Table size='small' rowKey='groupId' loading={loading} columns={columns} dataSource={list} pagination={{ pageSize: 15, hideOnSinglePage: true }} scroll={{ x: 560 }} locale={{ emptyText: "Belum ada transfer pada periode ini" }} />
          </div>
        </div>
      </div>

      <VoidModal
        open={!!voiding}
        title='Batalkan transfer?'
        description={voiding ? `Transfer ${rupiah(voiding.amount)} (${voiding.from.name} → ${voiding.to.name}) dibatalkan di kedua akun sekaligus.` : ""}
        onClose={() => setVoiding(null)}
        onConfirm={async (reason) => {
          await financeApi.voidTransfer(voiding.groupId, reason);
          message.success("Transfer dibatalkan");
          await Promise.all([reload(), loadList()]);
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------ PEMASUKAN LAIN
const IncomeTab = ({ accounts, reload }) => {
  const [accountId, setAccountId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [date, setDate] = useState(todayWIB());
  const [description, setDescription] = useState("");
  const [key, setKey] = useState(newKey());
  const [submitting, setSubmitting] = useState(false);

  const [range, setRange] = useRange();
  const [list, setList] = useState({ total: "0", items: [] });
  const [loading, setLoading] = useState(false);
  const [voiding, setVoiding] = useState(null);

  useEffect(() => {
    if (!accountId) setAccountId(accounts[0]?.id ?? null);
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadList = useCallback(async () => {
    if (range.start > range.end) return;
    setLoading(true);
    try {
      setList(await financeApi.incomes({ startDate: range.start, endDate: range.end }));
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const submit = async () => {
    if (!accountId || !amount || !date) {
      message.warning("Lengkapi akun, tanggal, dan nominal");
      return;
    }
    setSubmitting(true);
    try {
      const r = await financeApi.createIncome({
        accountId,
        amount: Number(amount),
        transactionDate: date,
        description: description.trim() || undefined,
        idempotencyKey: key,
      });
      message.success(r.replayed ? "Pemasukan ini sudah tersimpan sebelumnya" : `Tersimpan. Saldo akun: ${rupiah(r.balance)}`);
      setAmount(null);
      setDescription("");
      setKey(newKey());
      await Promise.all([reload(), loadList()]);
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "Tanggal", dataIndex: "transactionDate", render: fmtDate, width: 100 },
    { title: "Akun", render: (_, r) => <>{r.account.name} <Tag>{WALLET_LABEL[r.account.wallet]}</Tag></> },
    { title: "Keterangan", dataIndex: "description", ellipsis: true, render: (v) => v || "-" },
    { title: "Nominal", dataIndex: "amount", align: "right", render: rupiah },
    { title: "", width: 90, render: (_, r) => <Button size='small' danger type='text' onClick={() => setVoiding(r)}>Batalkan</Button> },
  ];

  return (
    <div className='row g-3'>
      <div className='col-12 col-xl-4'>
        <div className='card radius-12 border shadow-sm'>
          <div className='card-body p-16 p-md-24'>
            <h6 className='fw-semibold mb-16'>Pemasukan Lain</h6>
            <Alert type='info' showIcon className='mb-16' message='Untuk modal awal, saldo awal, atau dana masuk di luar penjualan harian. Penjualan dicatat di halaman Penjualan Harian, jangan dicatat dua kali.' />
            <Field label='Masuk ke akun'>
              <Select style={{ width: "100%" }} value={accountId} onChange={setAccountId} options={accounts.map((a) => ({ value: a.id, label: accountLabel(a) }))} />
            </Field>
            <Field label='Nominal'>
              <InputNumber {...moneyInputProps} size='large' addonBefore='Rp' inputMode='numeric' value={amount} onChange={setAmount} placeholder='0' />
            </Field>
            <Field label='Tanggal'>
              <Input type='date' value={date} max={todayWIB()} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </Field>
            <Field label='Keterangan (opsional)'>
              <Input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} placeholder='mis. Modal awal' />
            </Field>
            <Button type='primary' size='large' block loading={submitting} onClick={submit}>Simpan Pemasukan</Button>
          </div>
        </div>
      </div>

      <div className='col-12 col-xl-8'>
        <div className='card radius-12 border shadow-sm'>
          <div className='card-body p-16 p-md-24'>
            <div className='d-flex align-items-center mb-12'>
              <h6 className='fw-semibold mb-0 me-auto'>Riwayat Pemasukan Lain</h6>
              <b>{rupiah(list.total)}</b>
            </div>
            <RangeBar range={range} setRange={setRange} />
            <Table size='small' rowKey='id' loading={loading} columns={columns} dataSource={list.items} pagination={{ pageSize: 15, hideOnSinglePage: true }} scroll={{ x: 560 }} locale={{ emptyText: "Belum ada pemasukan pada periode ini" }} />
          </div>
        </div>
      </div>

      <VoidModal
        open={!!voiding}
        title='Batalkan pemasukan?'
        description={voiding ? `Pemasukan ${rupiah(voiding.amount)} tanggal ${fmtDate(voiding.transactionDate)} akan dikeluarkan dari saldo.` : ""}
        onClose={() => setVoiding(null)}
        onConfirm={async (reason) => {
          await financeApi.voidTransaction(voiding.id, reason);
          message.success("Pemasukan dibatalkan");
          await Promise.all([reload(), loadList()]);
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------ HALAMAN
const ExpenseLayer = () => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const [a, c] = await Promise.all([financeApi.accounts(), financeApi.categories()]);
      setAccounts(a.filter((x) => x.isActive));
      setCategories(c);
      setError("");
    } catch (e) {
      setError(errMsg(e));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const balances = useMemo(
    () => accounts.map((a) => ({ id: a.id, text: `${a.name}: ${rupiah(a.balance)}`, neg: Number(a.balance) < 0 })),
    [accounts]
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: BRAND } }}>
      {error && <Alert type='error' showIcon message={error} className='mb-16' />}

      {balances.length > 0 && (
        <div className='d-flex flex-wrap gap-2 mb-16'>
          {balances.map((b) => (
            <Tag key={b.id} color={b.neg ? "error" : "default"} style={{ fontSize: 13, padding: "4px 10px" }}>{b.text}</Tag>
          ))}
        </div>
      )}

      <Tabs
        destroyInactiveTabPane
        items={[
          { key: "expense", label: "Pengeluaran", children: <ExpenseTab accounts={accounts} categories={categories} reload={reload} /> },
          { key: "transfer", label: "Gaji & Transfer", children: <TransferTab accounts={accounts} reload={reload} /> },
          { key: "income", label: "Pemasukan Lain", children: <IncomeTab accounts={accounts} reload={reload} /> },
        ]}
      />
    </ConfigProvider>
  );
};

export default ExpenseLayer;