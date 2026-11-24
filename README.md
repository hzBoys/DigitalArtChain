# DigitalArtChain

Aplikasi web untuk membuat dan memverifikasi bukti digital karya menggunakan fingerprint SHA-256, tanda tangan wallet, dan timestamp blockchain.

## Fitur

- Menghitung fingerprint file di browser; file master tidak diunggah.
- Menghubungkan MetaMask dan menandatangani fingerprint pada jaringan Arbitrum Sepolia.
- Mencatat dan memverifikasi bukti melalui smart contract `ProofOfExistence`.
- Menawarkan publikasi preview ber-watermark ke IPFS melalui Pinata. Hanya preview yang diunggah, bukan file master.
- Menampilkan karya yang dipublikasikan di Galeri dan menyediakan halaman verifikasi.

## Teknologi

- Next.js 16 App Router, React 19, TypeScript
- Ethers.js untuk wallet dan interaksi kontrak
- Solidity dan `solc` untuk smart contract
- SWR untuk data sisi klien
- Pinata untuk penyimpanan preview IPFS opsional

## Menjalankan secara lokal

### Prasyarat

- Node.js 20.9 atau lebih baru
- pnpm 12.3.4 (versi yang dicantumkan di `package.json`)
- MetaMask jika ingin mencoba alur tanda tangan atau transaksi

### Instalasi

```bash
git clone https://github.com/hzBoys/DigitalArtChain.git
cd DigitalArtChain
corepack enable
corepack prepare pnpm@12.3.4 --activate
pnpm install
cp .env.example .env.local
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000). Di Windows, salin template dengan `Copy-Item .env.example .env.local` di PowerShell sebelum menjalankan `pnpm dev`.

`.env.example` berisi konfigurasi demo yang aman. Untuk menjalankan demo dasar, nilai default dapat dipertahankan. Jangan masukkan nilai rahasia ke source code atau commit file `.env.local`.

## Konfigurasi lingkungan

| Variabel | Kegunaan |
| --- | --- |
| `NEXT_PUBLIC_USE_MOCK_CONTRACT` | Default `true`: memakai registry demo di memori browser, tanpa transaksi blockchain. Untuk mencatat ke kontrak, ubah ke `false` dan atur alamat kontrak. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Alamat publik kontrak `ProofOfExistence` yang sudah di-deploy. Alamat hasil deploy dari halaman aplikasi hanya tersedia di sesi browser saat itu; atur variabel ini agar kontrak yang sama digunakan setelah refresh atau oleh pengguna lain. |
| `NEXT_PUBLIC_TARGET_CHAIN_ID` | Chain ID jaringan wallet; default `421614` (Arbitrum Sepolia). |
| `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC` | RPC publik opsional; jika kosong, aplikasi memakai RPC Arbitrum Sepolia bawaan. |
| `NEXT_PUBLIC_EXPLORER_URL` | URL block explorer; default Arbiscan Sepolia. |
| `NEXT_PUBLIC_CONTRACT_START_BLOCK` | Blok awal opsional untuk membatasi pemindaian event Galeri. |
| `NEXT_PUBLIC_PINATA_GATEWAY` | Gateway IPFS untuk menampilkan preview; default `https://gateway.pinata.cloud/ipfs`. |
| `PINATA_JWT` | Secret server-side Pinata. Diperlukan hanya jika pengguna memilih untuk mengunggah preview ke Galeri Publik. Jangan beri awalan `NEXT_PUBLIC_` atau commit nilainya. |

### Mode demo dan kontrak nyata

Mode demo tetap memerlukan wallet MetaMask di Arbitrum Sepolia untuk menandatangani fingerprint, tetapi tidak menulis transaksi ke blockchain. Registry demo hanya disimpan sementara di memori browser dan akan hilang saat halaman dimuat ulang.

Untuk penggunaan dengan kontrak nyata, deploy `ProofOfExistence` ke Arbitrum Sepolia, atur `NEXT_PUBLIC_CONTRACT_ADDRESS`, lalu set `NEXT_PUBLIC_USE_MOCK_CONTRACT=false`. Pengguna memerlukan test ETH untuk transaksi. Jika fitur Galeri Publik diaktifkan, konfigurasi `PINATA_JWT` juga harus tersedia di lingkungan server.

## Perintah proyek

```bash
pnpm dev                 # Jalankan server pengembangan
pnpm exec tsc --noEmit   # Periksa TypeScript
pnpm build               # Buat build produksi
pnpm start               # Jalankan build produksi
pnpm contract:compile    # Kompilasi kontrak dan perbarui artifact ABI/bytecode
```

## Struktur utama

- `app/` — halaman App Router dan route handler API.
- `src/components/` — komponen antarmuka, termasuk alur registrasi, verifikasi, dan galeri.
- `src/controllers/` — controller wallet dan hashing file.
- `src/models/` — model data, konfigurasi jaringan, ABI, dan registry demo.
- `src/services/contractService.ts` — operasi registri, verifikasi, deployment kontrak, serta pengambilan data galeri.
- `contracts/ProofOfExistence.sol` — smart contract pencatatan bukti.
- `scripts/compile-contract.mjs` — kompilasi kontrak ke artifact ABI dan bytecode.

## Halaman aplikasi

- `/` — Beranda
- `/register` — Catat karya
- `/verify` — Verifikasi bukti
- `/gallery` — Galeri publik

## Privasi dan batasan demo

File master diproses di browser dan tidak dikirim ke server. Jika pengguna memilih Galeri Publik, aplikasi membuat preview ber-watermark dan mengunggah preview itu ke Pinata. Mode demo tidak memakai database dan registry-nya bersifat sementara; catatan permanen memerlukan smart contract yang telah di-deploy.
