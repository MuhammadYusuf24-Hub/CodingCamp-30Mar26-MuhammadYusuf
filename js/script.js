// ===== DATA TRANSAKSI =====
let daftarData = JSON.parse(localStorage.getItem('transaksi')) || [];
let batasPengeluaran = Number(localStorage.getItem('batas')) || 0;
let modeGelap = localStorage.getItem('modeGelap') === 'true';

// ===== VARIABEL ELEMEN HTML =====
const inputNamaItem = document.getElementById('namaItem');
const inputJumlah = document.getElementById('jumlah');
const inputKategori = document.getElementById('kategori');
const tombolTambah = document.getElementById('tombolTambah');
const tampilDaftar = document.getElementById('daftarTransaksi');
const tampilSaldo = document.getElementById('totalSaldo');
const tombolMode = document.getElementById('tombolMode');
const inputBatas = document.getElementById('batasPengeluaran');
const tombolAturBatas = document.getElementById('tombolAturBatas');
const pilihanSortir = document.getElementById('pilihanSortir');

// ===== VARIABEL GRAFIK =====
let objekGrafik = null;

// ===== FUNGSI SIMPAN KE LOCALSTORAGE =====
function simpanKeLokal() {
    localStorage.setItem('transaksi', JSON.stringify(daftarData));
}

// ===== FUNGSI FORMAT RUPIAH =====
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// ===== FUNGSI HITUNG TOTAL SALDO =====
function hitungTotalSaldo() {
    const total = daftarData.reduce((jumlah, item) => jumlah + item.jumlah, 0);
    tampilSaldo.textContent = formatRupiah(total);

    // Cek batas pengeluaran
    const pesanBatas = document.getElementById('pesanBatas');
    if (batasPengeluaran > 0 && total > batasPengeluaran) {
        if (!pesanBatas) {
            const peringatan = document.createElement('p');
            peringatan.id = 'pesanBatas';
            peringatan.classList.add('peringatan-batas');
            peringatan.textContent = '⚠️ Pengeluaran kamu melebihi batas ' + formatRupiah(batasPengeluaran) + '!';
            tampilSaldo.parentElement.appendChild(peringatan);
        }
    } else {
        if (pesanBatas) pesanBatas.remove();
    }
}

// ===== FUNGSI SORTIR DATA =====
function sortirData(data) {
    const pilihan = pilihanSortir.value;
    const salinan = [...data];

    if (pilihan === 'jumlahNaik') {
        salinan.sort((a, b) => a.jumlah - b.jumlah);
    } else if (pilihan === 'jumlahTurun') {
        salinan.sort((a, b) => b.jumlah - a.jumlah);
    } else if (pilihan === 'kategori') {
        salinan.sort((a, b) => a.kategori.localeCompare(b.kategori));
    }

    return salinan;
}

// ===== FUNGSI TAMPILKAN DAFTAR TRANSAKSI =====
function tampilkanDaftar() {
    tampilDaftar.innerHTML = '';

    if (daftarData.length === 0) {
        tampilDaftar.innerHTML = '<p class="pesan-kosong">Belum ada transaksi.</p>';
        return;
    }

    // Tampilkan data sesuai pilihan sortir
    const dataTampil = sortirData(daftarData);

    dataTampil.forEach(function(item, indeks) {
        const divItem = document.createElement('div');
        divItem.classList.add('item-transaksi');

        // Cari indeks asli untuk hapus
        const indeksAsli = daftarData.findIndex(
            d => d.nama === item.nama && d.jumlah === item.jumlah && d.kategori === item.kategori
        );

        divItem.innerHTML = `
            <div class="info-transaksi">
                <p class="nama-item">${item.nama}</p>
                <p class="jumlah-item">${formatRupiah(item.jumlah)}</p>
                <span class="kategori-item">${item.kategori}</span>
            </div>
            <button class="tombol-hapus" onclick="hapusTransaksi(${indeksAsli})">Hapus</button>
        `;

        tampilDaftar.appendChild(divItem);
    });
}

// ===== FUNGSI TAMPILKAN GRAFIK PIE =====
function tampilkanGrafik() {
    const dataKategori = {};

    daftarData.forEach(function(item) {
        if (dataKategori[item.kategori]) {
            dataKategori[item.kategori] += item.jumlah;
        } else {
            dataKategori[item.kategori] = item.jumlah;
        }
    });

    const labelGrafik = Object.keys(dataKategori);
    const nilaiGrafik = Object.values(dataKategori);
    const warnaGrafik = ['#52b788', '#4895ef', '#f4a261', '#e63946', '#9b5de5', '#f15bb5'];

    if (objekGrafik !== null) {
        objekGrafik.destroy();
    }

    const kanvasBaru = document.getElementById('grafikPengeluaran');

    objekGrafik = new Chart(kanvasBaru, {
        type: 'pie',
        data: {
            labels: labelGrafik,
            datasets: [{
                data: nilaiGrafik,
                backgroundColor: warnaGrafik.slice(0, labelGrafik.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 13 } }
                }
            }
        }
    });
}

// ===== FUNGSI PERBARUI SEMUA TAMPILAN =====
function perbaruiTampilan() {
    hitungTotalSaldo();
    tampilkanDaftar();
    tampilkanGrafik();
}

// ===== FUNGSI TAMBAH TRANSAKSI =====
function tambahTransaksi() {
    const nama = inputNamaItem.value.trim();
    const jumlah = Number(inputJumlah.value);
    const kategori = inputKategori.value;

    if (nama === '' || inputJumlah.value === '' || kategori === '') {
        alert('Semua kolom harus diisi!');
        return;
    }

    if (jumlah <= 0) {
        alert('Jumlah harus lebih dari 0!');
        return;
    }

    const transaksinBaru = { nama, jumlah, kategori };

    daftarData.push(transaksinBaru);
    simpanKeLokal();

    inputNamaItem.value = '';
    inputJumlah.value = '';
    inputKategori.value = '';

    perbaruiTampilan();
}

// ===== FUNGSI HAPUS TRANSAKSI =====
function hapusTransaksi(indeks) {
    const konfirmasi = confirm('Yakin ingin menghapus transaksi ini?');
    if (konfirmasi) {
        daftarData.splice(indeks, 1);
        simpanKeLokal();
        perbaruiTampilan();
    }
}

// ===== FUNGSI DARK/LIGHT MODE =====
function terapkanMode() {
    if (modeGelap) {
        document.body.classList.add('mode-gelap');
        tombolMode.textContent = '☀️ Mode Terang';
    } else {
        document.body.classList.remove('mode-gelap');
        tombolMode.textContent = '🌙 Mode Gelap';
    }
}

function gantiMode() {
    modeGelap = !modeGelap;
    localStorage.setItem('modeGelap', modeGelap);
    terapkanMode();
}

// ===== FUNGSI ATUR BATAS PENGELUARAN =====
function aturBatas() {
    const nilai = Number(inputBatas.value);
    if (nilai <= 0) {
        alert('Batas pengeluaran harus lebih dari 0!');
        return;
    }
    batasPengeluaran = nilai;
    localStorage.setItem('batas', batasPengeluaran);
    alert('Batas pengeluaran berhasil diatur: ' + formatRupiah(batasPengeluaran));
    hitungTotalSaldo();
}

// ===== EVENT LISTENER =====
tombolTambah.addEventListener('click', tambahTransaksi);
tombolMode.addEventListener('click', gantiMode);
tombolAturBatas.addEventListener('click', aturBatas);
pilihanSortir.addEventListener('change', tampilkanDaftar);

// ===== JALANKAN SAAT HALAMAN PERTAMA DIBUKA =====
terapkanMode();
if (batasPengeluaran > 0) inputBatas.value = batasPengeluaran;
perbaruiTampilan();