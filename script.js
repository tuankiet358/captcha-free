document.addEventListener('DOMContentLoaded', () => {
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

    // 1. Thuật toán tạo chuỗi ngẫu nhiên chất lượng cao
    function generateCaptchaText() {
        // Loại bỏ các ký tự dễ gây nhầm lẫn: 0, O, o, 1, l, I
        const allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        let text = "";
        for (let i = 0; i < 6; i++) {
            text += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
        }
        return text;
    }

    // 2. Hàm vẽ CAPTCHA phức tạp (Bẻ cong, nhiễu hạt, đổi font)
    function drawAdvancedCaptcha() {
        currentCaptcha = generateCaptchaText();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Tạo background gradient lộn xộn nhẹ
        let bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, "#f3f4f6");
        bgGrad.addColorStop(1, "#e5e7eb");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Thêm các đường cong rối mắt (Chống Bot lưới tốt hơn đường thẳng)
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

        // Vẽ từng ký tự với font và hiệu ứng xoay, bẻ cong, đổ bóng khác nhau
        const fonts = ["Arial", "Verdana", "Georgia", "Courier New", "Impact"];
        
        for (let i = 0; i < currentCaptcha.length; i++) {
            const char = currentCaptcha[i];
            
            // Random cấu hình cho từng chữ
            const fontSize = Math.floor(Math.random() * 8) + 26; // 26px -> 34px
            const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
            ctx.font = `bold ${fontSize}px ${randomFont}`;
            
            // Đổ bóng giả để đánh lừa OCR bot
            ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
            ctx.shadowOffsetX = Math.random() * 3 - 1.5;
            ctx.shadowOffsetY = Math.random() * 3 - 1.5;
            ctx.shadowBlur = Math.random() * 2;

            ctx.fillStyle = `rgb(${Math.random()*120}, ${Math.random()*120}, ${Math.random()*120})`;

            ctx.save();
            // Căn lề vị trí x chuẩn để các ký tự không đè quá mức lên nhau
            const x = 18 + i * 32;
            const y = canvas.height / 2 + (Math.random() * 12 - 6);
            const angle = (Math.random() * 36 - 18) * Math.PI / 180; // Xoay tự do -18 đến 18 độ

            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(char, 0, canvas.height * 0.1); // tinh chỉnh trọng tâm chữ
            ctx.restore();
        }

        // Thêm lớp chấm nhiễu (noise) trên cùng bề mặt
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.4)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 3. Tính năng Cao Cấp: Phát âm thanh (Audio Captcha hỗ trợ người khiếm thị)
    function playAudioCaptcha() {
        if (!currentCaptcha) return;
        
        // Tách chuỗi thành từng ký tự để đọc ngắt quãng rõ ràng
        const spelledText = currentCaptcha.split("").join(", ");
        
        // Sử dụng API nhận diện giọng nói có sẵn trên trình duyệt (Web Speech API)
        const utterance = new SpeechSynthesisUtterance(spelledText);
        utterance.rate = 0.8; // Đọc hơi chậm lại để dễ nghe
        utterance.lang = 'en-US'; // Chuyển giọng đọc tiếng Anh chuẩn cho bảng chữ cái ký tự
        
        window.speechSynthesis.cancel(); // Dừng âm thanh cũ nếu có trước khi phát mới
        window.speechSynthesis.speak(utterance);
    }

    // 4. Xử lý logic kiểm tra kết quả
    function verifyCaptcha() {
        const userInput = captchaInput.value.trim();

        if (!userInput) {
            showStatus("error", "Vui lòng nhập mã bảo mật!");
            return;
        }

        // Kiểm tra không phân biệt hoa thường
        if (userInput.toLowerCase() === currentCaptcha.toLowerCase()) {
            showStatus("success", "Xác minh hoàn tất. Bạn là con người!");
            // Bạn có thể thêm code chuyển trang hoặc submit form thật ở đây
        } else {
            showStatus("error", "Mã xác minh chưa chính xác. Hãy thử lại!");
            captchaInput.value = "";
            drawAdvancedCaptcha(); // Tự động reset mã mới khi nhập sai
        }
    }

    // Hàm hiển thị thông báo mượt mà
    function showStatus(type, msg) {
        messageBox.className = `message-box ${type}`;
        msgText.textContent = msg;
        
        if (type === "success") {
            msgIcon.className = "fa-solid fa-circle-check";
        } else {
            msgIcon.className = "fa-solid fa-circle-exclamation";
        }
    }

    // Gán các sự kiện điều khiển
    drawAdvancedCaptcha(); // Khởi chạy lần đầu
    refreshBtn.addEventListener('click', () => {
        drawAdvancedCaptcha();
        messageBox.className = "message-box hidden";
        captchaInput.value = "";
    });
    audioBtn.addEventListener('click', playAudioCaptcha);
    submitBtn.addEventListener('click', verifyCaptcha);
    
    captchaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyCaptcha();
    });
});
