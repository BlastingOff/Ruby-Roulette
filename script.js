let riggedValue = null;

// Menu Toggle
document.getElementById('bet-category').addEventListener('change', function() {
    const isNum = this.value === 'number';
    document.getElementById('number-choice').classList.toggle('hidden', !isNum);
    document.getElementById('color-choice').classList.toggle('hidden', isNum);
});

// MASTER COMMANDS
// MASTER COMMANDS - AUTO-CLEAR VERSION
function checkMaster(event) {
    const input = document.getElementById('master-input');
    const cmd = input.value;

    // 1. Check for @gain (Instant Reset)
    if (cmd === "@gain") {
        resetGame();
        input.value = ""; // Clear immediately
        return;
    }

    // 2. Check for @rig [Number]
    if (cmd.startsWith("@rig ")) {
        const parts = cmd.split(" ");
        // We only trigger if there is a number after the space
        if (parts.length > 1 && parts[1] !== "") {
            const val = parseInt(parts[1]);
            
            // If it's a valid number between 1 and 12
            if (!isNaN(val) && val >= 1 && val <= 12) {
                riggedValue = val;
                
                // Visual feedback so you know it worked
                input.value = "SET " + val; 
                
                // Clear the box after half a second so it's hidden again
                setTimeout(() => {
                    input.value = "";
                }, 600);
            }
        }
    }
}

function resetGame() {
    const btn = document.getElementById('spin-btn');
    btn.disabled = false;
    btn.innerText = "SPIN THE WHEEL";
    document.getElementById('voucher-box').classList.add('hidden');
    const res = document.getElementById('wheel-result');
    res.innerText = "?";
    res.classList.remove('gem-ruby', 'gem-onyx', 'gem-emerald');
    res.style.backgroundColor = "white";
    res.style.color = "#222";
    riggedValue = null;
}

function playGame() {
    const btn = document.getElementById('spin-btn');
    btn.disabled = true;
    let count = 0;
    const anim = setInterval(() => {
        document.getElementById('wheel-result').innerText = Math.floor(Math.random() * 12) + 1;
        if (++count > 25) {
            clearInterval(anim);
            finalize();
        }
    }, 50);
}

function finalize() {
    const winningNumber = riggedValue ?? Math.floor(Math.random() * 12) + 1;
    riggedValue = null;
    const res = document.getElementById('wheel-result');
    res.innerText = winningNumber;
    res.classList.remove('gem-ruby', 'gem-onyx', 'gem-emerald');

    let color = "";
    if (winningNumber === 6) {
        color = "Green";
        res.classList.add('gem-emerald');
        triggerSparkles(); 
    } else if (winningNumber % 2 !== 0) {
        color = "Red";
        res.classList.add('gem-ruby');
    } else {
        color = "Black";
        res.classList.add('gem-onyx');
    }

    const cat = document.getElementById('bet-category').value;
    const choice = (cat === 'color') ? document.getElementById('color-choice').value.charAt(0) : "N" + document.getElementById('number-choice').value;
    document.getElementById('verification-code').innerText = `${choice}-${winningNumber}${color.charAt(0)}`.toUpperCase();
    document.getElementById('voucher-box').classList.remove('hidden');
}

function triggerSparkles() {
    const canvas = document.getElementById('sparkle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12,
            size: Math.random() * 6 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.size *= 0.97;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            if (p.size < 0.5) particles.splice(i, 1);
        });
        if (particles.length > 0) requestAnimationFrame(draw);
    }
    draw();
}