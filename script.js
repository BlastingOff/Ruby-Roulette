let riggedValue = null;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Master Controls
function checkMaster(event) {
    const input = document.getElementById('master-input');
    if (input.value === "@gain") { resetGame(); input.value = ""; }
    else if (input.value.startsWith("@rig ")) {
        const val = parseInt(input.value.split(" ")[1]);
        if (!isNaN(val) && val >= 1 && val <= 30) {
            riggedValue = val;
            input.value = "SET " + val;
            setTimeout(() => { input.value = ""; }, 600);
        }
    }
}

document.getElementById('bet-category').addEventListener('change', function() {
    const isNum = this.value === 'number';
    document.getElementById('number-choice').classList.toggle('hidden', !isNum);
    document.getElementById('color-choice').classList.toggle('hidden', isNum);
});

function resetGame() {
    document.getElementById('spin-btn').disabled = false;
    document.getElementById('voucher-box').classList.add('hidden');
    const res = document.getElementById('wheel-result');
    const startNum = Math.floor(Math.random() * 30) + 1;
    res.innerText = startNum;
    setWheelColor(res, startNum);
    res.classList.remove('gem-ruby', 'gem-onyx', 'gem-emerald');
}

function setWheelColor(element, num) {
    // UPDATED: 1 and 15 are now Green
    if (num === 1 || num === 15) {
        element.style.backgroundColor = '#2ecc71';
    } 
    else if (num % 2 !== 0) {
        element.style.backgroundColor = '#ff4d4d';
    } 
    else {
        element.style.backgroundColor = '#222';
    }
    element.style.color = "white";
}

window.onload = resetGame;

function playGame() {
    const btn = document.getElementById('spin-btn');
    const res = document.getElementById('wheel-result');
    const chart = document.getElementById('odds-chart');
    const lockedStatus = document.getElementById('locked-in-status');

    chart.classList.add('hidden');
    lockedStatus.classList.remove('hidden');
    btn.disabled = true;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let currentNum = parseInt(res.innerText) || 1;
    let ticksPerformed = 0;
    
    let target = riggedValue ?? Math.floor(Math.random() * 30) + 1;
    let totalTicks = (Math.floor(Math.random() * 2) + 3) * 30; 
    
    let distance = (target - currentNum + 30) % 30;
    if (distance === 0) distance = 30;
    totalTicks += distance;

    let delay = 35;

    function tick() {
        ticksPerformed++;
        currentNum = (currentNum % 30) + 1;
        res.innerText = currentNum;
        setWheelColor(res, currentNum);
        
        res.classList.remove('tick-effect');
        void res.offsetWidth; 
        res.classList.add('tick-effect');
        playClickSound(650 - (ticksPerformed * 2));

        if (ticksPerformed < totalTicks) {
            delay += (ticksPerformed / totalTicks) * 20; 
            setTimeout(tick, delay);
        } else {
            const extraJolt = riggedValue ? 0 : Math.floor(Math.random() * 3); 
            if (extraJolt > 0) {
                let joltCount = 0;
                function doJolt() {
                    joltCount++;
                    currentNum = (currentNum % 30) + 1;
                    res.innerText = currentNum;
                    setWheelColor(res, currentNum);
                    playClickSound(200);
                    if (joltCount < extraJolt) setTimeout(doJolt, delay * 2);
                    else finish(currentNum);
                }
                setTimeout(doJolt, delay * 1.5);
            } else { finish(currentNum); }
        }
    }
    tick();

    function finish(num) {
        chart.classList.remove('hidden');
        lockedStatus.classList.add('hidden');
        finalize(num);
        riggedValue = null;
    }
}

function finalize(finalNum) {
    const res = document.getElementById('wheel-result');
    // UPDATED: Logic to identify Green for 1 and 15
    const isGreen = (finalNum === 1 || finalNum === 15);
    let resultColor = isGreen ? "Green" : (finalNum % 2 !== 0 ? "Red" : "Black");
    
    if (resultColor === "Green") res.classList.add('gem-emerald');
    else if (resultColor === "Red") res.classList.add('gem-ruby');
    else res.classList.add('gem-onyx');

    const betType = document.getElementById('bet-category').value;
    const userColor = document.getElementById('color-choice').value;
    const userNum = document.getElementById('number-choice').value;
    let didWin = (betType === 'color') ? (userColor === resultColor) : (parseInt(userNum) === finalNum);

    // UPDATED: Grand sparkles for any green win
    if (didWin) triggerSparkles(isGreen);

    const choice = (betType === 'color') ? userColor.charAt(0) : "N" + userNum;
    document.getElementById('verification-code').innerText = `${choice}-${finalNum}${resultColor.charAt(0)}`.toUpperCase();
    document.getElementById('voucher-box').classList.remove('hidden');
}

function triggerSparkles(isGrand) {
    const canvas = document.getElementById('sparkle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    for (let i = 0; i < (isGrand ? 200 : 100); i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 18, vy: (Math.random() - 0.8) * 18,
            size: Math.random() * 6 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.size *= 0.98;
            ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            if (p.size < 0.5) particles.splice(i, 1);
        });
        if (particles.length > 0) requestAnimationFrame(draw);
    }
    draw();
}