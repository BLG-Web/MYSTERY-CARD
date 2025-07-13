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

// Validasi token ke endpoint Google Apps Script
async function cekInput() {
  const idVal = inputId.value.trim();
  const tokVal = inputToken.value.trim();
  btnSpin.disabled = true;
  btnSpin.classList.remove('active');
  desc.textContent = 'Isi ID dan Token, lalu tekan SPIN!';
  msg.textContent = '';
  if (idVal && tokVal) {
    desc.textContent = 'Cek token ke server...';
    try {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbwBaUl1wGX-P48lNPEA16r-usiwBxeW4TjExdEXxVh_3ETyW6MJx3MOdHxFfOKrmUKIFw/exec?token=${encodeURIComponent(tokVal)}`);
      const valid = await res.json();
      if (valid === true) {
        btnSpin.disabled = false;
        btnSpin.classList.add('active');
        desc.textContent = 'Tekan SPIN untuk mengacak kartu!';
      } else {
        desc.textContent = 'Token tidak valid atau sudah digunakan!';
        msg.textContent = 'Token tidak valid atau sudah digunakan!';
      }
    } catch(e) {
      desc.textContent = 'Gagal koneksi ke server.';
      msg.textContent = 'Gagal koneksi ke server.';
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
  desc.textContent = 'Mengacak kartu...';
  msg.textContent = '';
  shuffleAnim();
};

function shuffleAnim() {
  let duration = 2.5; // detik
  let maxSpin = Math.round(duration * 1000 / 60);
  let spin=0;
  const interval = setInterval(()=>{
    // Acak karakter untuk animasi visual
    const arr = hadiahList.slice().sort(()=>Math.random()-0.5);
    cards.forEach((c,i)=>{
      c.classList.add('card-anim');
      c.querySelector('.face').innerHTML = `<img src="${arr[i%arr.length].img}" style="filter:brightness(0.95) blur(0.5px);">`;
    });
    spin++;
    if (spin>maxSpin){
      clearInterval(interval);
      cards.forEach((c, i)=>{
        c.classList.remove('card-anim');
        c.querySelector('.face').innerHTML = `<img src="${LOGO_URL}">`;
        c.querySelector('.back').innerHTML = '';
      });
      hasilArr = hadiahList.slice().sort(()=>Math.random()-0.5).slice(0,8);
      enablePilihKartu(hasilArr);
    }
  },60);
}

function enablePilihKartu(arr) {
  desc.textContent = 'Pilih salah satu kartu!';
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
      desc.textContent = 'Klik CLAIM SEKARANG untuk klaim hadiah.';
      btnClaim.style.display = 'block';
      simpanLogSpin(currentUid, currentTok, `Kartu ${String.fromCharCode(65+idx)}`, h.hadiah, h.label);
    };
  });
}

// Kirim data ke endpoint Google Apps Script
async function simpanLogSpin(userId, token, pilihan, hasil, gambarDipilih) {
  try {
    await fetch('https://script.google.com/macros/s/AKfycbwBaUl1wGX-P48lNPEA16r-usiwBxeW4TjExdEXxVh_3ETyW6MJx3MOdHxFfOKrmUKIFw/exec', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userId, token, pilihan, hasil, gambarDipilih})
    });
  } catch(e) {
    alert('Gagal simpan log: '+e.message);
  }
}

btnClaim.onclick = ()=>{
  btnClaim.disabled = true;
  btnClaim.textContent = 'Berhasil diklaim!';
  desc.textContent = 'Terima kasih, data sudah dikirim.';
};
