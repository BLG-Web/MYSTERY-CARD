// Gambar hadiah (bisa diganti dengan gambar lebih keren di folder assets)
const hadiahList = [
  {img: 'https://imgur.com/cB74lvl.png', label: 'PANDA', hadiah: 'MENANG 15.000'},
  {img: 'https://imgur.com/aLShjER.png', label: 'KERBAU', hadiah: 'MENANG 10.000'},
  {img: 'https://imgur.com/Os0fSxf.png', label: 'PENAMBANG', hadiah: 'BONUS 5.000'},
  {img: 'https://imgur.com/XsDImXS.png', label: 'ZEUS', hadiah: 'ZONK'},
  {img: 'https://imgur.com/pmrp0zR.png', label: 'SINGA', hadiah: 'MENANG 20.000'},
  {img: 'https://imgur.com/1Q9QwQw.png', label: 'KUDA', hadiah: 'BONUS 7.000'},
  {img: 'https://imgur.com/2Q9QwQw.png', label: 'ELANG', hadiah: 'MENANG 25.000'},
  {img: 'https://imgur.com/3Q9QwQw.png', label: 'ZONK', hadiah: 'ZONK'}
];
const LOGO_URL = 'https://imgur.com/pmrp0zR.png';

const cardGrid = document.getElementById('cardGrid');
const inputId = document.getElementById('inputId');
const inputToken = document.getElementById('inputToken');
const btnSpin = document.getElementById('btnSpin');
const desc = document.getElementById('desc');
const msg = document.getElementById('msg');
const btnClaim = document.getElementById('btnClaim');
let cards = [];
let sudahSpin = false;
let hasilArr = [];
let currentUid, currentTok;
let selectedIdx = null;

// Fungsi helper untuk mengatur status agar tidak tertimpa
function setStatus(text) {
  desc.textContent = text;
  console.log('Status diset ke:', text);
}

function renderCardLogo() {
  cardGrid.innerHTML = '';
  cards = [];
  for(let i=0;i<8;i++){
    let outer = document.createElement('div');
    outer.className = 'card-outer';
    let c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `
      <div class="face"><img src="${LOGO_URL}"></div>
      <div class="back"></div>
    `;
    outer.appendChild(c);
    cardGrid.appendChild(outer);
    cards.push(c);
  }
}
renderCardLogo();

// Ganti endpoint ke Google Apps Script Web App langsung
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdivb2oMhr8JgXUc5ylKajDboZuvpRdGiVwmk7UHXO4mrwvNjx7QsxEYWG5l_ypw5s/exec';

// Validasi token ke endpoint Google Apps Script langsung
async function cekInput() {
  if (sudahSpin) {
    console.log('Sudah spin, tidak perlu cek input lagi');
    return; // Jangan cek token lagi setelah spin
  }
  const idVal = inputId.value.trim();
  const tokVal = inputToken.value.trim();
  btnSpin.disabled = true;
  btnSpin.classList.remove('active');
  desc.textContent = 'Isi ID dan Token, lalu tekan SPIN!';
  msg.textContent = '';
  
  if (idVal && tokVal) {
    desc.textContent = 'Cek token ke server...';
    console.log('Memulai validasi token...');
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?token=${encodeURIComponent(tokVal)}`);
      const valid = await res.json();
      if (valid === true) {
        btnSpin.disabled = false;
        btnSpin.classList.add('active');
        desc.textContent = 'Tekan SPIN untuk mengacak kartu!';
        console.log('Token valid, tombol SPIN aktif');
      } else {
        desc.textContent = 'Token tidak valid atau sudah digunakan!';
        msg.textContent = 'Token tidak valid atau sudah digunakan!';
        console.log('Token tidak valid');
      }
    } catch(e) {
      desc.textContent = 'Gagal koneksi ke server.';
      msg.textContent = 'Gagal koneksi ke server.';
      console.error('Error koneksi:', e);
    }
  }
}
inputId.oninput = cekInput;
inputToken.oninput = cekInput;

btnSpin.onclick = ()=>{
  if (sudahSpin) return;
  sudahSpin = true;
  currentUid = inputId.value.trim();
  currentTok = inputToken.value.trim();
  btnSpin.disabled = true;
  btnSpin.classList.remove('active');
  inputId.disabled = true;
  inputToken.disabled = true;
  // Lepas event handler input agar cekInput tidak bisa jalan lagi
  inputId.oninput = null;
  inputToken.oninput = null;
  setStatus('Mengacak kartu...');
  msg.textContent = '';
  shuffleAnim();
};

function shuffleAnim() {
  let duration = 4.0; // detik - lebih lama untuk animasi yang lebih smooth
  let totalFrames = Math.round(duration * 1000 / 50); // 50ms per frame untuk smooth animation
  let currentFrame = 0;
  
  // Pastikan status tetap 'Mengacak kartu...' selama animasi
  setStatus('Mengacak kartu...');
  
  // Fase 1: Kartu bergerak dan bertukar posisi (2 detik pertama)
  const shuffleInterval = setInterval(() => {
    if (currentFrame < totalFrames * 0.5) { // 50% waktu untuk shuffle
      // Animasi kartu bertukar posisi
      cards.forEach((card, i) => {
        card.classList.add('card-shuffle');
        
        // Random movement untuk setiap kartu
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 50;
        const randomRotate = (Math.random() - 0.5) * 360;
        const randomScale = 0.8 + Math.random() * 0.4;
        
        card.style.transform = `
          translate(${randomX}px, ${randomY}px) 
          rotate(${randomRotate}deg) 
          scale(${randomScale})
        `;
        card.style.zIndex = Math.floor(Math.random() * 10);
      });
    } else {
      // Fase 2: Kartu kembali ke posisi normal dan mulai flip
      clearInterval(shuffleInterval);
      
      // Reset posisi kartu
      cards.forEach((card, i) => {
        card.classList.remove('card-shuffle');
        card.style.transform = '';
        card.style.zIndex = '';
      });
      
      // Mulai fase flip animation
      startFlipAnimation();
    }
    currentFrame++;
  }, 50);
  
  function startFlipAnimation() {
    let flipFrame = 0;
    const flipDuration = totalFrames * 0.5; // 50% waktu sisanya untuk flip
    
    const flipInterval = setInterval(() => {
      // Acak gambar untuk setiap kartu dengan efek flip
      const arr = hadiahList.slice().sort(() => Math.random() - 0.5);
      
      cards.forEach((card, i) => {
        card.classList.add('card-flip-anim');
        
        // Efek flip 3D yang smooth
        const flipAngle = (flipFrame * 10) % 360;
        card.style.transform = `rotateY(${flipAngle}deg)`;
        
        // Ganti gambar pada titik tengah flip
        if (flipAngle % 180 < 90) {
          card.querySelector('.face').innerHTML = `
            <img src="${arr[i % arr.length].img}" 
                 style="filter: brightness(0.9) blur(0.3px) hue-rotate(${Math.random() * 360}deg);">
          `;
        } else {
          card.querySelector('.face').innerHTML = `
            <img src="${LOGO_URL}" 
                 style="filter: brightness(1.1) contrast(1.2);">
          `;
        }
        
        // Efek glow random
        if (Math.random() > 0.7) {
          card.style.boxShadow = `
            0 0 20px rgba(255, 215, 0, 0.6),
            0 0 40px rgba(255, 215, 0, 0.4),
            0 0 60px rgba(255, 215, 0, 0.2)
          `;
        } else {
          card.style.boxShadow = '';
        }
      });
      
      flipFrame++;
      
      if (flipFrame >= flipDuration) {
        clearInterval(flipInterval);
        finishAnimation();
      }
    }, 50);
  }
  
  function finishAnimation() {
    console.log('Animasi selesai, mempersiapkan kartu...');
    
    // Reset semua kartu ke kondisi normal
    cards.forEach((card, i) => {
      card.classList.remove('card-flip-anim', 'card-shuffle');
      card.style.transform = '';
      card.style.zIndex = '';
      card.style.boxShadow = '';
      card.querySelector('.face').innerHTML = `<img src="${LOGO_URL}">`;
      card.querySelector('.back').innerHTML = '';
    });
    
    // Animasi final: kartu muncul satu per satu
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('card-reveal');
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
          card.style.transform = '';
          card.classList.remove('card-reveal');
        }, 200);
      }, i * 100);
    });
    
    // Generate hasil dan aktifkan pemilihan kartu
    setTimeout(() => {
      hasilArr = hadiahList.slice().sort(() => Math.random() - 0.5).slice(0, 8);
      console.log('Memanggil enablePilihKartu...');
      enablePilihKartu(hasilArr);
    }, 800);
  }
}
function enablePilihKartu(arr) {
  // Pastikan status ter-update dengan benar
  console.log('enablePilihKartu dipanggil');
  // Gunakan timeout untuk memastikan status ter-update setelah animasi selesai
  setTimeout(() => {
    setStatus('Pilih salah satu kartu!');
  }, 200);
  
  cards.forEach((card,idx)=>{
    card.onclick = ()=>{
      if (selectedIdx !== null) return;
      selectedIdx = idx;
      const h = arr[idx];
      card.querySelector('.back').innerHTML = `
        <img src="${h.img}">
        <div class="hadiah-title">${h.hadiah}</div>
      `;
      card.querySelector('.face').innerHTML = `<img src="${h.img}">`;
      card.classList.add('flipped','selected');
      cards.forEach(c=>c.onclick=null);
      msg.innerHTML = h.hadiah.includes('MENANG')
        ? `🎉 <span style="color:#ffdc00">${h.hadiah}</span>`
        : `<span style="color:#ff3a3a">${h.hadiah}</span>`;
      setStatus('Klik CLAIM SEKARANG untuk klaim hadiah.');
      btnClaim.style.display = 'block';
      simpanLogSpin(currentUid, currentTok, `Kartu ${String.fromCharCode(65+idx)}`, h.hadiah, h.label);
    };
  });
}

// Kirim data ke endpoint Google Apps Script langsung
async function simpanLogSpin(userId, token, pilihan, hasil, gambarDipilih) {
  try {
    const params = new URLSearchParams({
      log: '1',
      userId,
      token,
      pilihan,
      hasil,
      gambarDipilih
    });
    await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
  } catch(e) {
    alert('Gagal simpan log: '+e.message);
  }
}

btnClaim.onclick = ()=>{
  btnClaim.disabled = true;
  btnClaim.textContent = 'Berhasil diklaim!';
  desc.textContent = 'Terima kasih, data sudah dikirim.';
};
