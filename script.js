/* ==================================================
   STATE & DATA MANAGEMENT
================================================== */
let jadwalPelajaran = JSON.parse(localStorage.getItem('jadwalPelajaran')) || [];
let jadwalBelajar = JSON.parse(localStorage.getItem('jadwalBelajar')) || [];
let tugas = JSON.parse(localStorage.getItem('tugas')) || [];
let profil = JSON.parse(localStorage.getItem('profil')) || {
    nama: "Siswa Demo", kelas: "10 IPA 1", email: "siswa@demo.com", username: "siswa123"
};
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Inisiasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    // Simulasi Splash Screen
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        cekLogin();
    }, 2000);

    // Event Listener Navigasi SPA
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-target');
            bukaHalaman(target);
        });
    });

    // Mulai Jam
    setInterval(updateJam, 1000);
    updateTanggal();

    // Event Listeners Forms
    document.getElementById('form-login').addEventListener('submit', prosesLogin);
    document.getElementById('form-jadwal').addEventListener('submit', simpanJadwal);
    document.getElementById('form-belajar').addEventListener('submit', simpanBelajar);
    document.getElementById('form-tugas').addEventListener('submit', simpanTugas);
    document.getElementById('form-profil').addEventListener('submit', simpanProfil);

    // Cek Reminder setiap 1 menit
    setInterval(cekPengingat, 60000);
});

/* ==================================================
   NAVIGASI & UI UMUM
================================================== */
function cekLogin() {
    if (isLoggedIn) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        muatDataAwal();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
}

function prosesLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    profil.username = user;
    profil.nama = user;
    localStorage.setItem('profil', JSON.stringify(profil));
    localStorage.setItem('isLoggedIn', 'true');
    isLoggedIn = true;
    showToast("Berhasil masuk", "success");
    cekLogin();
}

function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    isLoggedIn = false;
    cekLogin();
}

function bukaHalaman(id) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Render data spesifik saat halaman dibuka
    if(id === 'beranda') updateDashboard();
    if(id === 'jadwal-pelajaran') renderJadwalPelajaran();
    if(id === 'jadwal-belajar') renderJadwalBelajar();
    if(id === 'daftar-tugas') renderTugas();
    if(id === 'pengingat') renderPengingat();
    if(id === 'peringkat') renderPeringkat();
    if(id === 'profil') renderProfil();
}

function muatDataAwal() {
    // Generate data contoh jika kosong
    if (jadwalPelajaran.length === 0 && tugas.length === 0) {
        jadwalPelajaran.push({ id: Date.now(), hari: "Senin", mataPelajaran: "Matematika", jam: "07:00 - 08:30", guru: "Pak Budi", ruang: "Ruang 3" });
        tugas.push({ id: Date.now()+1, mataPelajaran: "Biologi", judulTugas: "Rangkuman Bab 1", deadline: new Date().toISOString().split('T')[0], status: "Belum Selesai" });
        simpanKeLocal();
    }
    updateDashboard();
    renderProfil();
}

function simpanKeLocal() {
    localStorage.setItem('jadwalPelajaran', JSON.stringify(jadwalPelajaran));
    localStorage.setItem('jadwalBelajar', JSON.stringify(jadwalBelajar));
    localStorage.setItem('tugas', JSON.stringify(tugas));
    localStorage.setItem('profil', JSON.stringify(profil));
    updateDashboard();
}

function hapusSemuaData() {
    if(confirm("Yakin ingin menghapus SEMUA data? Aksi ini tidak dapat dibatalkan.")) {
        jadwalPelajaran = []; jadwalBelajar = []; tugas = [];
        simpanKeLocal();
        showToast("Semua data berhasil dihapus", "success");
        bukaHalaman('beranda');
    }
}

/* ==================================================
   DASHBOARD / BERANDA
================================================== */
function updateJam() {
    const now = new Date();
    document.getElementById('jam-sekarang').textContent = now.toLocaleTimeString('id-ID');
}

function updateTanggal() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('tanggal-sekarang').textContent = new Date().toLocaleDateString('id-ID', options);
}

function updateDashboard() {
    document.getElementById('sapaan-user').textContent = `Halo, ${profil.nama}! 👋`;
    
    const namaHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
    
    const jadwalHariIni = jadwalPelajaran.filter(j => j.hari.toLowerCase() === namaHariIni.toLowerCase()).length;
    const belajarHariIni = jadwalBelajar.filter(b => b.hari.toLowerCase() === namaHariIni.toLowerCase()).length;
    const tugasBelum = tugas.filter(t => t.status !== 'Selesai').length;
    const tugasSelesai = tugas.filter(t => t.status === 'Selesai').length;

    document.getElementById('stat-jadwal-hari-ini').textContent = jadwalHariIni;
    document.getElementById('stat-belajar-hari-ini').textContent = belajarHariIni;
    document.getElementById('stat-tugas-belum').textContent = tugasBelum;
    document.getElementById('stat-tugas-selesai').textContent = tugasSelesai;
}

/* ==================================================
   CRUD: JADWAL PELAJARAN
================================================== */
function renderJadwalPelajaran() {
    const container = document.getElementById('container-jadwal');
    const filterHari = document.getElementById('filter-hari-jadwal').value;
    
    let filtered = jadwalPelajaran;
    if(filterHari !== 'Semua') {
        filtered = jadwalPelajaran.filter(j => j.hari === filterHari);
    }

    container.innerHTML = filtered.length ? filtered.map(j => `
        <div class="card">
            <span class="badge" style="background:var(--primary); color:white">${j.hari}</span>
            <h4 class="mt-10">${j.mataPelajaran}</h4>
            <p><i class="far fa-clock"></i> ${j.jam}</p>
            <p><i class="fas fa-user-tie"></i> ${j.guru}</p>
            <p><i class="fas fa-door-open"></i> ${j.ruang}</p>
            <div class="card-actions">
                <button class="btn-outline btn-small" onclick="editJadwal(${j.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-danger btn-small" onclick="hapusJadwal(${j.id})"><i class="fas fa-trash"></i> Hapus</button>
            </div>
        </div>
    `).join('') : '<p class="text-muted">Tidak ada jadwal.</p>';
}

function simpanJadwal(e) {
    e.preventDefault();
    const id = document.getElementById('jadwal-id').value;
    const data = {
        id: id ? parseInt(id) : Date.now(),
        hari: document.getElementById('jadwal-hari').value,
        mataPelajaran: document.getElementById('jadwal-mapel').value,
        jam: document.getElementById('jadwal-jam').value,
        guru: document.getElementById('jadwal-guru').value,
        ruang: document.getElementById('jadwal-ruang').value
    };

    if(id) {
        const index = jadwalPelajaran.findIndex(j => j.id == id);
        jadwalPelajaran[index] = data;
        showToast("Jadwal diperbarui", "success");
    } else {
        jadwalPelajaran.push(data);
        showToast("Jadwal berhasil ditambahkan", "success");
    }
    
    simpanKeLocal();
    tutupModal('modal-jadwal');
    renderJadwalPelajaran();
}

function editJadwal(id) {
    const j = jadwalPelajaran.find(x => x.id === id);
    document.getElementById('jadwal-id').value = j.id;
    document.getElementById('jadwal-hari').value = j.hari;
    document.getElementById('jadwal-mapel').value = j.mataPelajaran;
    document.getElementById('jadwal-jam').value = j.jam;
    document.getElementById('jadwal-guru').value = j.guru;
    document.getElementById('jadwal-ruang').value = j.ruang;
    document.getElementById('judul-modal-jadwal').textContent = "Edit Jadwal";
    bukaModal('modal-jadwal');
}

function hapusJadwal(id) {
    if(confirm('Hapus jadwal ini?')) {
        jadwalPelajaran = jadwalPelajaran.filter(x => x.id !== id);
        simpanKeLocal();
        renderJadwalPelajaran();
        showToast("Jadwal dihapus", "success");
    }
}

/* ==================================================
   CRUD: JADWAL BELAJAR
================================================== */
function renderJadwalBelajar() {
    const container = document.getElementById('container-belajar');
    container.innerHTML = jadwalBelajar.length ? jadwalBelajar.map(b => `
        <div class="card">
            <span class="badge" style="background:#8b5cf6; color:white">${b.hari}</span>
            <h4 class="mt-10">${b.materi}</h4>
            <p><i class="far fa-clock"></i> Pukul ${b.jam}</p>
            <div class="card-actions">
                <button class="btn-outline btn-small" onclick="editBelajar(${b.id})">Edit</button>
                <button class="btn-danger btn-small" onclick="hapusBelajar(${b.id})">Hapus</button>
            </div>
        </div>
    `).join('') : '<p class="text-muted">Belum ada jadwal belajar mandiri.</p>';
}

function simpanBelajar(e) {
    e.preventDefault();
    const id = document.getElementById('belajar-id').value;
    const data = {
        id: id ? parseInt(id) : Date.now(),
        hari: document.getElementById('belajar-hari').value,
        jam: document.getElementById('belajar-jam').value,
        materi: document.getElementById('belajar-materi').value
    };

    if(id) {
        const index = jadwalBelajar.findIndex(x => x.id == id);
        jadwalBelajar[index] = data;
        showToast("Jadwal Belajar diperbarui", "success");
    } else {
        jadwalBelajar.push(data);
        showToast("Jadwal Belajar disimpan", "success");
    }
    
    simpanKeLocal();
    tutupModal('modal-belajar');
    renderJadwalBelajar();
}

function editBelajar(id) {
    const b = jadwalBelajar.find(x => x.id === id);
    document.getElementById('belajar-id').value = b.id;
    document.getElementById('belajar-hari').value = b.hari;
    document.getElementById('belajar-jam').value = b.jam;
    document.getElementById('belajar-materi').value = b.materi;
    document.getElementById('judul-modal-belajar').textContent = "Edit Jadwal Belajar";
    bukaModal('modal-belajar');
}

function hapusBelajar(id) {
    if(confirm('Hapus jadwal belajar ini?')) {
        jadwalBelajar = jadwalBelajar.filter(x => x.id !== id);
        simpanKeLocal();
        renderJadwalBelajar();
        showToast("Jadwal dihapus", "success");
    }
}

/* ==================================================
   CRUD: DAFTAR TUGAS
================================================== */
function renderTugas() {
    const container = document.getElementById('container-tugas');
    const filterStatus = document.getElementById('filter-status-tugas').value;
    
    // Urutkan tugas berdasarkan deadline terdekat
    let sortedTugas = [...tugas].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    let filtered = sortedTugas;
    
    if(filterStatus !== 'Semua') {
        filtered = sortedTugas.filter(t => t.status === filterStatus);
    }

    container.innerHTML = filtered.length ? filtered.map(t => {
        let statusClass = t.status.split(' ')[0]; // Ambil kata pertama untuk class css
        return `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h4>${t.mataPelajaran}</h4>
                <p>${t.judulTugas}</p>
                <p class="text-danger" style="font-size:12px"><i class="fas fa-calendar-times"></i> Deadline: ${t.deadline}</p>
                <span class="badge ${statusClass} mt-10" style="display:inline-block">${t.status}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:5px">
                <button class="btn-success btn-small" onclick="ubahStatusTugas(${t.id})" style="background:var(--success); color:white; border:none"><i class="fas fa-check"></i> Status</button>
                <button class="btn-outline btn-small" onclick="editTugas(${t.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-danger btn-small" onclick="hapusTugas(${t.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `}).join('') : '<p class="text-muted">Tidak ada tugas.</p>';
}

function simpanTugas(e) {
    e.preventDefault();
    const id = document.getElementById('tugas-id').value;
    const data = {
        id: id ? parseInt(id) : Date.now(),
        mataPelajaran: document.getElementById('tugas-mapel').value,
        judulTugas: document.getElementById('tugas-judul').value,
        deadline: document.getElementById('tugas-deadline').value,
        status: document.getElementById('tugas-status').value
    };

    if(id) {
        const index = tugas.findIndex(x => x.id == id);
        tugas[index] = data;
        showToast("Tugas diperbarui", "success");
    } else {
        tugas.push(data);
        showToast("Tugas ditambahkan", "success");
    }
    
    simpanKeLocal();
    tutupModal('modal-tugas');
    renderTugas();
}

function editTugas(id) {
    const t = tugas.find(x => x.id === id);
    document.getElementById('tugas-id').value = t.id;
    document.getElementById('tugas-mapel').value = t.mataPelajaran;
    document.getElementById('tugas-judul').value = t.judulTugas;
    document.getElementById('tugas-deadline').value = t.deadline;
    document.getElementById('tugas-status').value = t.status;
    document.getElementById('judul-modal-tugas').textContent = "Edit Tugas";
    bukaModal('modal-tugas');
}

function hapusTugas(id) {
    if(confirm('Hapus tugas ini?')) {
        tugas = tugas.filter(x => x.id !== id);
        simpanKeLocal();
        renderTugas();
        showToast("Tugas dihapus", "success");
    }
}

function ubahStatusTugas(id) {
    const t = tugas.find(x => x.id === id);
    if(t.status === 'Belum Selesai') t.status = 'Sedang Dikerjakan';
    else if(t.status === 'Sedang Dikerjakan') t.status = 'Selesai';
    else t.status = 'Belum Selesai';
    
    simpanKeLocal();
    renderTugas();
    showToast("Status tugas diperbarui", "success");
}

/* ==================================================
   PENGINGAT (REMINDERS)
================================================== */
function renderPengingat() {
    const container = document.getElementById('container-pengingat');
    let reminderHTML = '';
    const today = new Date().toISOString().split('T')[0];
    
    // Tugas yang deadline hari ini atau lewat
    const tugasUrgent = tugas.filter(t => t.status !== 'Selesai' && t.deadline <= today);
    
    if(tugasUrgent.length > 0) {
        reminderHTML += `<h3>Tugas Mendesak</h3>`;
        tugasUrgent.forEach(t => {
            reminderHTML += `<div class="card" style="border-left:4px solid var(--danger)">
                <strong>${t.mataPelajaran}</strong>: ${t.judulTugas} (Deadline: ${t.deadline})
            </div>`;
        });
    } else {
        reminderHTML += `<p class="text-muted">Tidak ada tugas mendesak hari ini.</p>`;
    }
    container.innerHTML = reminderHTML;
}

function mintaIzinNotifikasi() {
    if (!("Notification" in window)) {
        alert("Browser Anda tidak mendukung notifikasi desktop.");
    } else if (Notification.permission === "granted") {
        showToast("Notifikasi sudah aktif!", "success");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("StudySchedule", { body: "Notifikasi berhasil diaktifkan!" });
            }
        });
    }
}

function cekPengingat() {
    const now = new Date();
    const jamSekarang = now.toTimeString().substring(0,5); // HH:MM format
    const hariSekarang = now.toLocaleDateString('id-ID', { weekday: 'long' });

    jadwalBelajar.forEach(b => {
        if(b.hari.toLowerCase() === hariSekarang.toLowerCase() && b.jam === jamSekarang) {
            tampilkanNotifikasi("Waktunya Belajar!", `Saatnya belajar: ${b.materi}`);
        }
    });
}

function tampilkanNotifikasi(judul, pesan) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(judul, { body: pesan, icon: 'assets/logo.svg' });
    } else {
        // Fallback in-app toast
        showToast(`${judul}: ${pesan}`, "success");
    }
}

/* ==================================================
   PERINGKAT (SIMULASI)
================================================== */
function renderPeringkat() {
    const container = document.getElementById('container-peringkat');
    // Dummy Data Leaderboard
    let dummyData = [
        { nama: "Budi Santoso", skor: 950 },
        { nama: "Siti Aminah", skor: 820 },
        { nama: profil.nama, skor: tugas.filter(t=>t.status==='Selesai').length * 50 }, // Skor dari tugas selesai
        { nama: "Joko Anwar", skor: 640 },
        { nama: "Rina Nose", skor: 510 }
    ];
    
    // Urutkan
    dummyData.sort((a,b) => b.skor - a.skor);

    container.innerHTML = dummyData.map((d, index) => `
        <div class="leaderboard-item">
            <div style="display:flex; align-items:center; gap:15px">
                <div class="rank-badge ${index === 0 ? 'text-warning' : ''}" style="${index===0 ? 'background:gold':''}">${index + 1}</div>
                <strong>${d.nama} ${d.nama === profil.nama ? '(Kamu)' : ''}</strong>
            </div>
            <div><i class="fas fa-star text-warning"></i> ${d.skor} Poin</div>
        </div>
    `).join('');
}

/* ==================================================
   PROFIL
================================================== */
function renderProfil() {
    document.getElementById('display-nama').textContent = profil.nama;
    document.getElementById('display-kelas').textContent = profil.kelas;
    
    document.getElementById('profil-nama').value = profil.nama;
    document.getElementById('profil-kelas').value = profil.kelas;
    document.getElementById('profil-email').value = profil.email;
}

function simpanProfil(e) {
    e.preventDefault();
    profil.nama = document.getElementById('profil-nama').value;
    profil.kelas = document.getElementById('profil-kelas').value;
    profil.email = document.getElementById('profil-email').value;
    simpanKeLocal();
    renderProfil();
    showToast("Profil berhasil diperbarui", "success");
}

/* ==================================================
   FUNGSI BANTUAN (MODAL & TOAST)
================================================== */
function bukaModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function tutupModal(id) {
    document.getElementById(id).classList.add('hidden');
    // Reset form jika ditutup
    const form = document.querySelector(`#${id} form`);
    if(form) form.reset();
    const idInput = document.querySelector(`#${id} input[type="hidden"]`);
    if(idInput) idInput.value = '';
}

function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${type === 'success' ? 'fas fa-check-circle text-green' : 'fas fa-exclamation-circle text-danger'}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}