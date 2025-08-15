const images = [
  "omena.svg",
  "paaryna.svg",
  "kirsikat.svg",
  "vesimeloni.svg",
  "seiska.svg"
];

const imageNames = {
  "omena.svg": "omena",
  "paaryna.svg": "paaryna",
  "kirsikat.svg": "kirsikka",
  "vesimeloni.svg": "meloni",
  "seiska.svg": "7"
};

let secondRound = false;
let roundBet = null;   // Kierroksen panos jäädytetty
let canLock = false;   // Saako juuri nyt lukita rullia

let balance = 10;
let locked = [false, false, false, false];
let reels = ["", "", "", ""];

const balanceEl = document.getElementById("balance");
const resultEl = document.getElementById("result");
const playBtn = document.getElementById("play");
const betInput = document.getElementById("bet");
const reelImgs = [...Array(4)].map((_, i) => document.getElementById(`reel${i}`));
const lockBtns = document.querySelectorAll(".lock");

const historyEl = document.getElementById("history");

function addToHistory(win, combination) {
  const li = document.createElement("li");
  li.textContent = `+€${win} → ${combination.join(" - ")}`;
  historyEl.prepend(li);
  if (historyEl.children.length > 10) {
    historyEl.removeChild(historyEl.lastChild);
  }
}

function updateBalance() {
  balanceEl.textContent = balance.toFixed(2);
}

function spinReels() {
  for (let i = 0; i < 4; i++) {
    if (!locked[i]) {
      const img = images[Math.floor(Math.random() * images.length)];
      reels[i] = img;
      reelImgs[i].src = `${img}`;
      const reelDiv = reelImgs[i].parentElement;
      reelDiv.classList.add("spin");
      setTimeout(() => reelDiv.classList.remove("spin"), 600);
    }
  }
}

function checkWin(bet) {
  const names = reels.map(r => imageNames[r]);
  const counts = {};
  names.forEach(n => counts[n] = (counts[n] || 0) + 1);

  let win = 0;
  if (counts["7"] === 4) win = bet * 10;
  else if (counts["omena"] === 4) win = bet * 6;
  else if (counts["meloni"] === 4) win = bet * 5;
  else if (counts["paaryna"] === 4) win = bet * 4;
  else if (counts["kirsikka"] === 4) win = bet * 3;
  else if (counts["7"] === 3) win = bet * 5;

  return win;
}

function refreshLockIcons() {
  lockBtns.forEach(btn => {
    const i = parseInt(btn.dataset.index);
    btn.textContent = locked[i] ? "🔒" : "🔓"; // lukittu = 🔒, auki = 🔓
  });
}

function setLocking(enabled) {
  canLock = enabled;
  lockBtns.forEach(btn => {
    btn.disabled = !enabled;
  });
}

function resetLocks() {
  locked = [false, false, false, false];
  refreshLockIcons();
}


playBtn.addEventListener("click", () => {
  if (!secondRound) {
    // Ensimmäinen kierros - jäädytetään panos
    roundBet = parseInt(betInput.value);

    if (roundBet > balance) {
      resultEl.textContent = "Ei tarpeeksi rahaa!";
      return;
    }

    // Estetään panoksen muuttaminen kierroksen aikana
    betInput.disabled = true;

    // Veloitetaan panos ensimmäisestä pyöräytyksestä
    balance -= roundBet;
    updateBalance();

    // Ei saa lukita ennen ensimmäistä tulosta
    setLocking(false);

    spinReels();
    const win = checkWin(roundBet);

    if (win > 0) {
      balance += win;
      resultEl.textContent = `Voitto! Saat €${win}`;
      addToHistory(win, reels.map(r => imageNames[r]));

      // Kierros päättyy heti voittoon
      resetLocks();          // Kaikki auki
      setLocking(false);     // Ei lukitusta
      secondRound = false;
      betInput.disabled = false;
      roundBet = null;
    } else {
      resultEl.textContent = "Ei voittoa. Voit lukita rullia ja yrittää uudelleen.";
      secondRound = true;
      setLocking(true);      // Nyt lukitus sallittu
    }

    checkGameOver();

  } else {
    // Toinen kierros – käytetään täsmälleen samaa roundBet-arvoa
    if (roundBet == null) {
      // Varotoimi, jos jostain syystä roundBet puuttuu
      roundBet = parseInt(betInput.value);
    }

    if (roundBet > balance) {
      resultEl.textContent = "Ei tarpeeksi rahaa toiseen pyöräytykseen.";
      // Kierros keskeytyy siististi
      resetLocks();
      setLocking(false);
      secondRound = false;
      betInput.disabled = false;
      roundBet = null;
      checkGameOver();
      return;
    }
    balance -= roundBet;
    updateBalance();

    spinReels();
    const win = checkWin(roundBet);

    if (win > 0) {
      balance += win;
      resultEl.textContent = `Voitto toisella kierroksella! Saat €${win}`;
      addToHistory(win, reels.map(r => imageNames[r]));
    } else {
      resultEl.textContent = "Ei voittoa toisellakaan kierroksella.";
    }

    resetLocks();          // Lukitukset pois
    setLocking(false);     // Ei voi lukita ennen uutta kierrosta
    secondRound = false;
    betInput.disabled = false;
    roundBet = null;

    checkGameOver();
  }
});

// Lukitusnapit toimivat vain kun lukitus on sallittu
lockBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!canLock) return;  // ignore, jos ei saa lukita juuri nyt 
    const index = parseInt(btn.dataset.index);
    locked[index] = !locked[index];
    refreshLockIcons();
  });
});

updateBalance();

function initReels() {
  for (let i = 0; i < 4; i++) {
    const img = images[Math.floor(Math.random() * images.length)];
    reels[i] = img;
    reelImgs[i].src = `${img}`;
  }
}

initReels();
resetLocks();      // Alussa kaikki auki
setLocking(false); // Alussa lukitus ei käytössä

function checkGameOver() {
  if (balance < 1) {
    resultEl.textContent = "Rahat loppuivat! Aloitetaan alusta...";
    setTimeout(() => {
      balance = 10;
      updateBalance();
      resultEl.textContent = "Uusi peli käynnistetty. Onnea matkaan!";
      initReels();
      resetLocks();
      setLocking(false);
      secondRound = false;
      betInput.disabled = false;
      roundBet = null;
    }, 2000);
  }
}

