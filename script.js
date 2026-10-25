let imgbox = document.getElementById("imgbox");
let qrimage = document.getElementById("qrimage");
let qrtext = document.getElementById("qrtext");
let qrOverlay = document.getElementById("qrOverlay");
let actionButtons = document.getElementById("actionButtons");
let sizeButtons = document.querySelectorAll('.size-btn');
let clearBtn = document.getElementById("clearBtn");
let downloadBtn = document.getElementById("downloadBtn");
let colorBtn = document.getElementById("colorBtn");
let colorModal = document.getElementById("colorModal");
let closeModal = document.getElementById("closeModal");
let applyColorsBtn = document.getElementById("applyColors");
let fgColor = document.getElementById("fgColor");
let bgColor = document.getElementById("bgColor");
let colorPreview = document.getElementById("colorPreview");

let currentSize = 150;
let currentColors = {
    fg: '#000000',
    bg: '#ffffff'
};

document.addEventListener('DOMContentLoaded', function() {
    sizeButtons.forEach(btn => {
        if(btn.dataset.size == currentSize) {
            btn.classList.add('active');
        }
    });
    
    updateColorPreview();
    actionButtons.style.display = 'none';
    qrtext.focus();
    
    qrtext.addEventListener('keyup', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            generateqr();
        }
    });
});

sizeButtons.forEach(button => {
    button.addEventListener('click', function() {
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentSize = parseInt(this.dataset.size);
        
        if(qrimage.src && qrimage.src !== '' && qrtext.value) {
            generateqr();
        }
    });
});

clearBtn.addEventListener('click', function() {
    qrtext.value = '';
    qrtext.focus();
});

function generateqr() {
    if (qrtext.value.trim().length > 0) {
        if (window.innerWidth < 768) {
            qrtext.blur();
        }
        
        qrimage.style.opacity = '0.3';
        qrOverlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Generating QR Code...</p>';
        qrOverlay.style.display = 'flex';
        
        const encodedText = encodeURIComponent(qrtext.value.trim());
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${currentSize}x${currentSize}&data=${encodedText}&color=${currentColors.fg.substring(1)}&bgcolor=${currentColors.bg.substring(1)}`;
        
        qrimage.src = qrUrl;
        
        qrimage.onload = function() {
            imgbox.classList.add("show-img");
            qrOverlay.style.display = 'none';
            qrimage.style.opacity = '1';
            actionButtons.style.display = 'flex';
            qrimage.setAttribute('data-qr-url', qrUrl);
        };
        
        qrimage.onerror = function() {
            qrOverlay.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Failed to generate. Try again.</p>';
            qrimage.style.opacity = '1';
            qrimage.src = '';
        };
    } else {
        qrtext.classList.add('error');
        qrtext.style.animation = 'none';
        setTimeout(() => {
            qrtext.style.animation = 'shake 0.4s';
        }, 10);
        
        setTimeout(() => {
            qrtext.classList.remove('error');
        }, 1000);
        
        qrtext.focus();
    }
}

function downloadQR() {
    if (!qrimage.src || qrimage.src === '' || qrimage.src.includes('data:image')) {
        alert("Please generate a QR code first!");
        return;
    }
    
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    downloadBtn.disabled = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        const filename = `QR-Code-${Date.now()}.png`;
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        downloadBtn.style.background = '#10b981';
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.background = '';
            downloadBtn.disabled = false;
        }, 2000);
    };
    
    img.onerror = function() {
        const qrUrl = qrimage.getAttribute('data-qr-url') || qrimage.src;
        window.open(qrUrl, '_blank');
        
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    };
    
    img.src = qrimage.src + '?' + new Date().getTime();
}

colorBtn.addEventListener('click', function() {
    colorModal.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
    colorModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target == colorModal) {
        colorModal.style.display = 'none';
    }
});

applyColorsBtn.addEventListener('click', function() {
    currentColors.fg = fgColor.value;
    currentColors.bg = bgColor.value;
    updateColorPreview();
    colorModal.style.display = 'none';
    
    if(qrimage.src && qrimage.src !== '' && qrtext.value) {
        generateqr();
    }
});

function updateColorPreview() {
    colorPreview.style.background = `linear-gradient(45deg, ${currentColors.fg} 50%, ${currentColors.bg} 50%)`;
}