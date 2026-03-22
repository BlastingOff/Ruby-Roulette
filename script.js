let riggedValue = null;

// Toggle Menus
document.getElementById('bet-category').addEventListener('change', function() {
    if (this.value === 'number') {
        document.getElementById('number-choice').classList.remove('hidden');
        document.getElementById('color-choice').classList.add('hidden');
    } else {
        document.getElementById('number-choice').classList.add('hidden');
        document.getElementById('color-choice').classList.remove('hidden');
    }
});

// Master Control Logic
function checkMaster(event) {
    const input = document.getElementById('master-input');
    const cmd = input.value;

    if (cmd === "@gain") {
        resetGame();
        input.value = "";
    } else if (cmd.startsWith("@rig ")) {
        const val = parseInt(cmd.split(" ")[1]);
        if (val >= 1 && val <= 12) {
            riggedValue = val;
            console.log("Next spin rigged to: " + riggedValue);
            input.value = "READY";
            setTimeout(() => { input.value = ""; }, 1000);
        }
    }
}

function resetGame() {
    const spinBtn = document.getElementById('spin-btn');
    const resultDisplay = document.getElementById('wheel-result');
    const voucherBox = document.getElementById('voucher-box');
    
    spinBtn.disabled = false;
    spinBtn.innerText = "SPIN FOR PRIZE";
    voucherBox.classList.add('hidden');
    resultDisplay.innerText = "?";
    resultDisplay.style.backgroundColor = "white";
    resultDisplay.style.color = "black";
    riggedValue = null;
}

function playGame() {
    const spinBtn = document.getElementById('spin-btn');
    const resultDisplay = document.getElementById('wheel-result');

    spinBtn.disabled = true;
    let counter = 0;
    
    const interval = setInterval(() => {
        resultDisplay.innerText = Math.floor(Math.random() * 12) + 1;
        counter++;
        if (counter > 20) {
            clearInterval(interval);
            finalizeResult();
        }
    }, 60);
}

function finalizeResult() {
    const category = document.getElementById('bet-category').value;
    const colorChoice = document.getElementById('color-choice').value;
    const numberChoice = document.getElementById('number-choice').value;
    const resultDisplay = document.getElementById('wheel-result');
    const codeDisplay = document.getElementById('verification-code');

    // Use rigged value if set, otherwise random
    const winningNumber = (riggedValue !== null) ? riggedValue : Math.floor(Math.random() * 12) + 1;
    riggedValue = null; // Reset rig after use

    resultDisplay.innerText = winningNumber;

    // Color Rules
    let resultColor = "";
    if (winningNumber === 6) {
        resultColor = "Green";
        resultDisplay.style.backgroundColor = "#2ecc71";
    } else if (winningNumber % 2 !== 0) {
        resultColor = "Red";
        resultDisplay.style.backgroundColor = "#ff4d4d";
    } else {
        resultColor = "Black";
        resultDisplay.style.backgroundColor = "#333";
        resultDisplay.style.color = "white";
    }

    // Voucher Generation
    let choiceKey = (category === 'color') ? "C" + colorChoice.charAt(0) : "N" + numberChoice;
    const resultKey = resultColor.charAt(0);
    codeDisplay.innerText = `${choiceKey}-${winningNumber}${resultKey}`.toUpperCase();
    
    document.getElementById('voucher-box').classList.remove('hidden');
    document.getElementById('spin-btn').innerText = "TURN COMPLETE";
}