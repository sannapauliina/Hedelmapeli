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

  // Säilytetään 10 viimeisintä
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

playBtn.addEventListener("click", () => {
  const bet = parseInt(betInput.value);

  if (!secondRound) {
    // Ensimmäinen kierros
    if (bet > balance) {
      resultEl.textContent = "Ei tarpeeksi rahaa!";
      return;
    }

    balance -= bet;
    spinReels();
    const win = checkWin(bet);

    if (win > 0) {
      balance += win;
      resultEl.textContent = `Voitto! Saat €${win}`;
      addToHistory(win, reels.map(r => imageNames[r]));
      locked = [false, false, false, false];
      lockBtns.forEach(btn => btn.textContent = "🔒");
      secondRound = false;
    } else {
      resultEl.textContent = "Ei voittoa. Voit lukita rullia ja yrittää uudelleen.";
      secondRound = true;
    }

    updateBalance();
    checkGameOver();

  } else {
    // Toinen kierros
    spinReels();
    const win = checkWin(bet);

    if (win > 0) {
      balance += win;
      resultEl.textContent = `Voitto toisella kierroksella! Saat €${win}`;
      addToHistory(win, reels.map(r => imageNames[r]));
    } else {
      resultEl.textContent = "Ei voittoa toisellakaan kierroksella.";
    }

    locked = [false, false, false, false];
    lockBtns.forEach(btn => btn.textContent = "🔒");
    secondRound = false;
    updateBalance();
    checkGameOver();
  }
});


lockBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const index = parseInt(btn.dataset.index);
    locked[index] = !locked[index];
    btn.textContent = locked[index] ? "🔓" : "🔒";
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

initReels(); // kutsutaan heti kun skripti latautuu

function checkGameOver() {
  if (balance < 1) {
    resultEl.textContent = "Rahat loppuivat! Aloitetaan alusta...";
    setTimeout(() => {
      balance = 10;
      updateBalance();
      resultEl.textContent = "Uusi peli käynnistetty. Onnea matkaan!";
      initReels();
    }, 2000);
  }
}

