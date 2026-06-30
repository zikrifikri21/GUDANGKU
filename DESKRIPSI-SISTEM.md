# Deskripsi Sistem Warehouse Management System

## Gambaran Umum

Warehouse Management System adalah aplikasi manajemen gudang modern yang dibangun untuk membantu operasional penyimpanan barang secara terpusat, cepat, dan real-time. Sistem ini mendukung pengelolaan data produk, kategori, supplier, transaksi stok masuk dan keluar, serta pemantauan stok minimum agar proses kontrol persediaan menjadi lebih akurat.

Aplikasi ini menggunakan Laravel 13 sebagai backend dan React dengan Inertia.js sebagai frontend. Untuk kebutuhan komunikasi real-time, sistem memanfaatkan Laravel Reverb sehingga perubahan data stok dapat langsung terlihat oleh pengguna yang sedang terhubung.

## Tujuan Sistem

- Mempermudah pengelolaan data master gudang seperti produk, kategori, dan supplier.
- Mencatat setiap pergerakan stok masuk dan keluar secara terstruktur.
- Menyediakan informasi stok secara real-time untuk mengurangi risiko selisih data.
- Memberikan peringatan ketika stok barang berada di bawah batas minimum.
- Mendukung operasional gudang yang lebih efisien, terdokumentasi, dan mudah dipantau.

## Fitur Utama

### 1. Manajemen Produk
Sistem menyediakan modul untuk menambah, mengubah, melihat, dan menghapus data produk. Informasi produk mencakup SKU, nama barang, deskripsi, stok, satuan, harga, gambar, serta batas stok minimum.

### 2. Manajemen Kategori
Produk dapat dikelompokkan ke dalam kategori tertentu agar proses pencarian, klasifikasi, dan pelaporan barang menjadi lebih mudah.

### 3. Manajemen Supplier
Data supplier disimpan lengkap beserta informasi kontak dan alamatnya, sehingga memudahkan proses pelacakan sumber pengadaan barang.

### 4. Transaksi Stok
Setiap stok masuk dan stok keluar dicatat sebagai riwayat transaksi. Dengan pendekatan ini, sistem dapat membantu pelacakan perubahan jumlah barang dari waktu ke waktu.

### 5. Peringatan Stok Minimum
Sistem mendeteksi produk yang stoknya berada di bawah batas minimum, lalu menampilkan notifikasi agar admin atau petugas gudang dapat segera mengambil tindakan.

### 6. Realtime Update
Perubahan data seperti transaksi stok, pembaruan produk, dan peringatan stok rendah dapat dikirim secara langsung ke client yang aktif tanpa perlu me-refresh halaman.

### 7. Autentikasi Pengguna
Sistem dilengkapi autentikasi berbasis Laravel Fortify untuk memastikan akses aplikasi lebih aman dan hanya dapat digunakan oleh pengguna yang berwenang.

## Pengguna Sistem

Secara umum, sistem ini dapat digunakan oleh:

- Admin gudang untuk mengelola data master dan memantau keseluruhan operasional.
- Petugas gudang untuk mencatat transaksi stok masuk dan keluar.
- Pihak manajemen untuk melihat kondisi persediaan secara cepat dan akurat.

## Alur Kerja Sistem

1. Pengguna login ke aplikasi menggunakan akun yang valid.
2. Pengguna mengelola data master seperti kategori, supplier, dan produk.
3. Saat ada barang masuk atau keluar, pengguna mencatat transaksi pada sistem.
4. Sistem memperbarui jumlah stok produk secara otomatis.
5. Jika stok melewati batas minimum, sistem menampilkan peringatan.
6. Perubahan tersebut dapat diteruskan secara real-time ke pengguna lain yang sedang aktif.

## Arsitektur Teknologi

Sistem ini dibangun dengan komponen utama berikut:

- Backend: Laravel 13
- Frontend: React + Inertia.js
- Realtime: Laravel Reverb
- Styling: Tailwind CSS
- Database: MySQL
- Testing: Pest PHP
- Code Quality: Pint, ESLint, dan Prettier

## Struktur Deployment Docker

Berdasarkan konfigurasi `docker-compose.yml`, sistem dijalankan menggunakan beberapa service:

### 1. Nginx
Berfungsi sebagai web server utama yang menerima request dari pengguna dan meneruskan request PHP ke container aplikasi. Nginx juga menangani static assets serta proxy untuk koneksi Reverb/WebSocket.

### 2. App Container
Container aplikasi menjalankan Laravel melalui PHP-FPM. Di dalam container ini juga berjalan beberapa proses penting melalui Supervisor:

- PHP-FPM untuk menjalankan aplikasi web Laravel
- Laravel Reverb untuk komunikasi real-time
- Queue worker untuk memproses antrian pekerjaan
- Scheduler untuk menjalankan task terjadwal Laravel

### 3. MySQL
Digunakan sebagai database utama untuk menyimpan seluruh data aplikasi, termasuk data produk, supplier, kategori, transaksi stok, dan pengguna.

## Integrasi Realtime

Sistem menggunakan Laravel Reverb untuk mendukung pembaruan data secara langsung. Konfigurasi Nginx menunjukkan dua jalur utama:

- `/app` untuk koneksi WebSocket
- `/reverb` untuk HTTP API Reverb

Dengan konfigurasi ini, notifikasi perubahan stok dan update data dapat dikirim ke browser pengguna secara real-time.

## Data yang Dikelola

Secara umum sistem mengelola entitas berikut:

- Produk
- Kategori
- Supplier
- Transaksi stok
- Pengguna

Relasi data tersebut memungkinkan sistem mencatat barang berdasarkan kategori dan supplier, serta melacak histori pergerakan stok oleh pengguna tertentu.

## Manfaat Sistem

- Mengurangi kesalahan pencatatan stok secara manual
- Mempercepat proses monitoring persediaan barang
- Memudahkan pelacakan histori transaksi
- Membantu pengambilan keputusan saat stok menipis
- Mendukung kolaborasi tim dengan informasi yang selalu terbarui

## Kesimpulan

Warehouse Management System ini dirancang sebagai solusi pengelolaan gudang yang terintegrasi, aman, dan responsif. Dengan dukungan fitur CRUD data master, transaksi stok, notifikasi stok minimum, serta arsitektur real-time berbasis Laravel Reverb, sistem ini cocok digunakan untuk meningkatkan efektivitas operasional gudang pada lingkungan bisnis modern.
