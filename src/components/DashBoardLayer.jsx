"use client";
// src/components/DashBoardLayer.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Input, Button, message, ConfigProvider } from "antd";
import { Icon } from "@iconify/react/dist/iconify.js";
import FinanceQuickCard from "@/components/finance/FinanceQuickCard";

const BRAND = "#7C0000";
const WAIT_TEXT = "mohon ditunggu";
const READY_TEXT = "pesanan siap, silakan ambil";
const READY_COLOR = "#16a34a";
const PIN_LENGTH = 4;
const PIN_REGEX = new RegExp(`^[A-Z0-9]{${PIN_LENGTH}}$`);

// Tambah / ubah tombol cukup di sini
//  - announceName : nama channel disebut di suara ("Shopee, mohon ditunggu")
//  - requirePin   : wajib isi PIN 4 karakter, PIN ikut disebut di suara
//  - Offline      : tanpa nama channel -> "Mohon ditunggu" (default)
const CHANNELS = [
  { id: "shopee", label: "Shopee", icon: "mdi:shopping", color: "#EE4D2D", announceName: true, placeholder: "Nama / No. pesanan (opsional)" },
  { id: "gojek", label: "Gojek", icon: "mdi:motorbike", color: "#00AA13", announceName: true, requirePin: true },
  { id: "grab", label: "Grab", icon: "mdi:car-hatchback", color: "#007A3D", announceName: true, placeholder: "Nama driver / pemesan (opsional)" },
  { id: "offline", label: "Offline", icon: "mdi:storefront", color: BRAND, announceName: false, placeholder: "Nama / No. antrian (opsional)" },
];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Susun kalimat yang diucapkan
//  Shopee            -> "Shopee, mohon ditunggu"
//  Shopee + nama     -> "Shopee Budi, mohon ditunggu"
//  Gojek + PIN       -> "Gojek, nomor pin B, A, 7, 2, mohon ditunggu"
//  Offline           -> "Mohon ditunggu"
//  Offline + nama    -> "Budi, mohon ditunggu"
//  Kalimat penutup bisa diganti: WAIT_TEXT ("mohon ditunggu") atau READY_TEXT ("pesanan siap")
//  Gojek + PIN       -> "Gojek, nomor pin B, A, 7, 2, pesanan siap"
//  Shopee + nama     -> "Shopee Budi, pesanan siap"
//  Offline           -> "Pesanan siap"
const buildSpeech = (channel, name, pin, text = WAIT_TEXT) => {
  if (channel.requirePin) {
    const spelled = pin.split("").join(", "); // dieja satu-satu
    return `${channel.label}, nomor pin ${spelled}, ${text}`;
  }
  const prefix = [channel.announceName ? channel.label : "", name.trim()]
    .filter(Boolean)
    .join(" ");
  return prefix ? `${prefix}, ${text}` : capitalize(text);
};

const DashBoardLayer = () => {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);

  // Cari suara Bahasa Indonesia (daftar voice dimuat async di beberapa browser)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith("id")) || null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      message.error("Browser ini tidak mendukung suara");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.rate = 0.95;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.speak(utter);
  }, []);

  const openModal = (channel) => {
    setName("");
    setPin("");
    setSelected(channel);
  };
  const closeModal = () => setSelected(null);

  const pinValid = PIN_REGEX.test(pin);
  const canConfirm = !selected?.requirePin || pinValid;

  const announce = (text) => {
    if (!selected || !canConfirm) return;
    speak(buildSpeech(selected, name, pin, text));
    closeModal();
  };
  const handleConfirm = () => announce(WAIT_TEXT); // juga dipakai tombol Enter
  const handleReady = () => announce(READY_TEXT);

  // Pratinjau kalimat yang akan diucapkan
  const previewPin = selected?.requirePin ? (pinValid ? pin : "_".repeat(PIN_LENGTH)) : "";
  const previewWait = selected ? buildSpeech(selected, name, previewPin, WAIT_TEXT) : "";
  const previewReady = selected ? buildSpeech(selected, name, previewPin, READY_TEXT) : "";

  return (
    <ConfigProvider theme={{ token: { colorPrimary: BRAND } }}>
      <div className='card radius-12 border shadow-sm'>
        <div className='card-body p-16 p-md-24'>
          {/* <h6 className='fw-semibold mb-16'>Panggilan Pesanan</h6> */}

          {/* 2 x 2 di mobile, 4 sejajar di layar besar */}
          <div className='row g-3'>
            {CHANNELS.map((ch) => (
              <div key={ch.id} className='col-6 col-lg-3'>
                <button
                  type='button'
                  onClick={() => openModal(ch)}
                  disabled={speaking}
                  aria-label={`Panggil ${ch.label}`}
                  className='w-100 border-0 d-flex flex-column align-items-center justify-content-center gap-2 text-white fw-bold'
                  style={{
                    backgroundColor: ch.color,
                    borderRadius: 16,
                    height: "clamp(130px, 28vw, 220px)",
                    fontSize: "clamp(16px, 4.5vw, 26px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    opacity: speaking ? 0.6 : 1,
                    transition: "transform .1s, opacity .2s",
                  }}
                  onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Icon icon={ch.icon} style={{ fontSize: "clamp(36px, 10vw, 64px)" }} />
                  {ch.label}
                </button>
              </div>
            ))}
          </div>

          {speaking && (
            <p className='text-center text-secondary-light mt-16 mb-0'>
              <Icon icon='mdi:volume-high' /> Sedang memanggil...
            </p>
          )}
        </div>
      </div>

      {/* Keuangan: tombol cepat + ringkasan (gagal dimuat tidak mengganggu tombol panggilan) */}
      <div className='mt-16'>
        <FinanceQuickCard />
      </div>

      <Modal
        open={!!selected}
        title={selected ? `Konfirmasi ${selected.label}` : ""}
        onCancel={closeModal}
        centered
        destroyOnClose
        footer={[
          <Button key='cancel' onClick={closeModal}>
            Batal
          </Button>,
          <Button
            key='ready'
            type='primary'
            disabled={!canConfirm}
            onClick={handleReady}
            style={canConfirm ? { backgroundColor: READY_COLOR, borderColor: READY_COLOR } : undefined}
          >
            Pesanan Siap
          </Button>,
          <Button key='wait' type='primary' disabled={!canConfirm} onClick={handleConfirm}>
            Minta Tunggu
          </Button>,
        ]}
      >
        <p className='mb-4'>
          Minta Tunggu: <b>&quot;{previewWait}&quot;</b>
        </p>
        <p className='mb-12'>
          Pesanan Siap: <b>&quot;{previewReady}&quot;</b>
        </p>

        {selected?.requirePin ? (
          <>
            <Input
              size='large'
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, PIN_LENGTH))
              }
              onPressEnter={handleConfirm}
              placeholder={`PIN Gojek (${PIN_LENGTH} karakter) *`}
              maxLength={PIN_LENGTH}
              status={pin && !pinValid ? "error" : ""}
              autoFocus
              allowClear
              style={{ letterSpacing: 6, textAlign: "center", fontWeight: 700 }}
            />
            {pin && !pinValid && (
              <div className='text-danger-main text-sm mt-8'>
                PIN wajib {PIN_LENGTH} karakter (huruf/angka)
              </div>
            )}
          </>
        ) : (
          <Input
            size='large'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleConfirm}
            placeholder={selected?.placeholder}
            maxLength={40}
            allowClear
          />
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default DashBoardLayer;