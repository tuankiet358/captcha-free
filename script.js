const canvas = document.getElementById('captchaCanvas');
const ctx = canvas.getContext('2d');
const refreshBtn = document.getElementById('refreshBtn');
const audioBtn = document.getElementById('audioBtn');
const submitBtn = document.getElementById('submitBtn');
const captchaInput = document.getElementById('captchaInput');
const messageBox = document.getElementById('messageBox');
const msgIcon = document.getElementById('msgIcon');
const msgText = document.getElementById('msgText');

let currentCaptcha = "";

// 1. Thuật toán tạo chuỗi ngẫu nhiên
function generateCaptchaText() {
    const allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
        text += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
    return text;
}

// 2. Hàm vẽ CAPTCHA
function drawAdvancedCaptcha() {
    if (!canvas) return;
    currentCaptcha = generateCaptchaText();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, "#f3f4f6");
    bgGrad.addColorStop(1, "#e5e7eb");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(${Math.random()*180}, ${Math.random()*180}, ${Math.random()*180}, 0.4)`;
        ctx.lineWidth = Math.random() * 2 + 1.5;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * canvas.height);
        ctx.bezierCurveTo(
            canvas.width / 3, Math.random() * canvas.height,
            (canvas.width / 3) * 2, Math.random() * canvas.height,
            canvas.width, Math.random() * canvas.height
        );
        ctx.stroke();
    }

    const fonts = ["Arial", "Verdana", "Georgia", "Courier New", "Impact"];
    
    for (let i = 0; i < currentCaptcha.length; i++) {
        const char = currentCaptcha[i];
        const fontSize = Math.floor(Math.random() * 8) + 26; 
        const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
        ctx.font = `bold ${fontSize}px ${randomFont}`;
        
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowOffsetX = Math.random() * 3 - 1.5;
        ctx.shadowOffsetY = Math.random() * 3 - 1.5;
        ctx.shadowBlur = Math.random() * 2;

        ctx.fillStyle = `rgb(${Math.random()*120}, ${Math.random()*120}, ${Math.random()*120})`;

        ctx.save();
        const x = 18 + i * 32;
        const y = canvas.height / 2 + (Math.random() * 12 - 6);
        const angle = (Math.random() * 36 - 18) * Math.PI / 180; 

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(char, 0, canvas.height * 0.1); 
        ctx.restore();
    }

    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.4)`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 3. Tính năng Audio
function playAudioCaptcha() {
    if (!currentCaptcha) return;
    const spelledText = currentCaptcha.split("").join(", ");
    const utterance = new SpeechSynthesisUtterance(spelledText);
    utterance.rate = 0.8; 
    utterance.lang = 'en-US'; 
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);
}

// 4. Xác minh
function verifyCaptcha() {
    const userInput = captchaInput.value.trim();
    if (!userInput) {
        showStatus("error", "Vui lòng nhập mã bảo mật!");
        return;
    }
    if (userInput.toLowerCase() === currentCaptcha.toLowerCase()) {
        showStatus("success", "Xác minh hoàn tất. Bạn là con người!");
    } else {
        showStatus("error", "Mã xác minh chưa chính xác. Hãy thử lại!");
        captchaInput.value = "";
        drawAdvancedCaptcha(); 
    }
}

function showStatus(type, msg) {
    if(!messageBox) return;
    messageBox.className = `message-box ${type}`;
    msgText.textContent = msg;
    if (type === "success") {
        msgIcon.className = "fa-solid fa-circle-check";
    } else {
        msgIcon.className = "fa-solid fa-circle-exclamation";
    }
}

// KHỞI CHẠY LẬP TỨC KHI FILE TẢI XONG
drawAdvancedCaptcha();

// Gán sự kiện cho các nút bấm nếu chúng tồn tại
if(refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        drawAdvancedCaptcha();
        if(messageBox) messageBox.className = "message-box hidden";
        captchaInput.value = "";
    });
}
if(audioBtn) audioBtn.addEventListener('click', playAudioCaptcha);
if(submitBtn) submitBtn.addEventListener('click', verifyCaptcha);
if(captchaInput) {
    captchaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyCaptcha();
    });
}

