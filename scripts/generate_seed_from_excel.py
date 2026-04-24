from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Sound Okt 25.xlsx"
TARGET = ROOT / "src" / "data" / "importedAlat.ts"


def normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value).strip())


def to_kategori(nama: str, jenis: str) -> str:
    combined = f"{nama} {jenis}".lower()
    if "mixer" in combined:
        return "Mixer"
    if any(token in combined for token in ("amplifier", "power amp", " amp ")):
        return "Amplifier"
    if any(token in combined for token in ("speaker", "subwoofer", "monitor", "pa system")):
        return "Speaker"
    if any(token in combined for token in ("mic", "microphone", "clip on", "headset", "lav", "wireless")):
        return "Microphone"
    if any(token in combined for token in ("kabel", "cable", "xlr", "jack", "rca", "trs")):
        return "Kabel"
    if any(token in combined for token in ("equalizer", "compressor", "effect", "efek", "di box", "processor")):
        return "Efek"
    return "Lainnya"


def to_kondisi(value: object) -> str:
    source = str(value).lower().strip()
    if "rusak berat" in source:
        return "Rusak Berat"
    if "rusak ringan" in source or "rusak" in source:
        return "Rusak Ringan"
    if any(token in source for token in ("perlu", "service", "maint")):
        return "Perlu Perbaikan"
    return "Baik"


def format_tahun(value: object) -> str:
    raw = str(value).strip()
    if raw == "" or raw.lower() == "nan":
        return ""
    try:
        return str(int(float(raw)))
    except ValueError:
        return raw


def main() -> None:
    df = pd.read_excel(SOURCE).fillna("")
    seen_codes: dict[str, int] = {}
    rows = []

    for idx, row in df.iterrows():
        nama = normalize_text(row.get("Nama Barang", "")) or "Tanpa Nama"
        merek = normalize_text(row.get("Merek", "")) or "-"
        jenis = normalize_text(row.get("Jenis Barang", ""))

        kode_base = normalize_text(row.get("Kode", "")) or f"ALAT-{idx + 1:03d}"
        kode_base = kode_base.upper().replace(" ", "")
        seen_codes[kode_base] = seen_codes.get(kode_base, 0) + 1
        kode = f"{kode_base}-{seen_codes[kode_base]:02d}" if seen_codes[kode_base] > 1 else kode_base

        jumlah_value = row.get("Jumlah", 1)
        try:
            jumlah = int(float(str(jumlah_value)))
        except ValueError:
            jumlah = 1
        jumlah = max(1, jumlah)

        tahun = format_tahun(row.get("Tahun", ""))
        nomor_seri = normalize_text(row.get("Nomor seri", ""))
        keterangan_parts = []
        if jenis:
            keterangan_parts.append(f"Jenis: {jenis}")
        if tahun:
            keterangan_parts.append(f"Tahun: {tahun}")
        if nomor_seri:
            keterangan_parts.append(f"No. Seri: {nomor_seri}")

        rows.append(
            {
                "id": f"seed-{idx + 1:03d}",
                "nama": nama,
                "kode": kode,
                "kategori": to_kategori(nama, jenis),
                "merek": merek,
                "jumlah": jumlah,
                "jumlahTersedia": jumlah,
                "status": "Tersedia",
                "kondisi": to_kondisi(row.get("Kondisi", "")),
                "keterangan": " | ".join(keterangan_parts),
                "createdAt": "2025-10-01T00:00:00.000Z",
            }
        )

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TARGET.open("w", encoding="utf-8") as f:
        f.write("import type { Alat } from '../types'\n\n")
        f.write("export const importedAlat: Alat[] = [\n")
        for item in rows:
            f.write(f"  {json.dumps(item, ensure_ascii=False)},\n")
        f.write("]\n")

    print(f"Generated {len(rows)} rows -> {TARGET}")


if __name__ == "__main__":
    main()
