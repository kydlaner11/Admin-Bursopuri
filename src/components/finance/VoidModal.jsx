"use client";
import { useEffect, useState } from "react";
import { Input, Modal, message } from "antd";
import { errMsg } from "@/utils/financeFormat";

// Pembatalan (void) selalu butuh alasan, karena data keuangan tidak dihapus permanen.
// onConfirm(reason) harus mengembalikan Promise; modal tertutup bila berhasil.
const VoidModal = ({ open, title = "Batalkan data ini?", description, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const valid = reason.trim().length >= 3;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={busy ? undefined : onClose}
      onOk={submit}
      okText='Ya, batalkan'
      cancelText='Kembali'
      okButtonProps={{ danger: true, disabled: !valid, loading: busy }}
      centered
      destroyOnClose
    >
      {description && <p className='mb-12'>{description}</p>}
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onPressEnter={submit}
        placeholder='Alasan pembatalan (wajib, min. 3 huruf)'
        maxLength={300}
        autoFocus
      />
      <div className='text-secondary-light text-sm mt-8'>
        Data tidak dihapus, hanya ditandai batal dan tercatat di riwayat audit.
      </div>
    </Modal>
  );
};

export default VoidModal;