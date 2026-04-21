const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const widthRange = document.getElementById('widthRange');
const heightRange = document.getElementById('heightRange');
const qualityRange = document.getElementById('qualityRange');
const fileNameInput = document.getElementById('fileName');
const downloadBtn = document.getElementById('downloadBtn');

const container = document.querySelector('.container');
container.style.position = "relative";

// 📊 overlay stats
const stats = document.createElement('div');
stats.style.position = "absolute";
stats.style.top = "120px";
stats.style.left = "20px";
stats.style.background = "rgba(0,0,0,0.6)";
stats.style.color = "white";
stats.style.padding = "10px";
stats.style.borderRadius = "8px";
stats.style.fontSize = "12px";
stats.style.zIndex = "10";
container.appendChild(stats);

// ✍️ Manual pixel inputs (NEW FEATURE)
const widthInput = document.createElement('input');
widthInput.type = "number";
widthInput.placeholder = "Width px (e.g. 927)";
widthInput.style.width = "100%";
widthInput.style.marginTop = "5px";

const heightInput = document.createElement('input');
heightInput.type = "number";
heightInput.placeholder = "Height px (e.g. 1080)";
heightInput.style.width = "100%";
heightInput.style.marginTop = "5px";

widthRange.parentNode.insertBefore(widthInput, widthRange.nextSibling);
heightRange.parentNode.insertBefore(heightInput, heightRange.nextSibling);

let img = new Image();
let originalFileSize = 0;
let originalWidth = 0;
let originalHeight = 0;

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  originalFileSize = file.size;

  const reader = new FileReader();

  reader.onload = function(event) {
    img.src = event.target.result;
  }

  reader.readAsDataURL(file);
});

img.onload = function () {
  originalWidth = img.naturalWidth;
  originalHeight = img.naturalHeight;

  widthRange.value = originalWidth;
  heightRange.value = originalHeight;

  widthInput.value = originalWidth;
  heightInput.value = originalHeight;

  drawImage();
  calculateSize();
};

// 🎯 sync function
function syncValues() {
  widthRange.value = widthInput.value;
  heightRange.value = heightInput.value;
  drawImage();
}

// 🔁 draw image
function drawImage() {
  const width = parseInt(widthRange.value);
  const height = parseInt(heightRange.value);

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  calculateSize();
}

// 📊 stats update
function updateStats(size) {
  if (!originalFileSize) return;

  const originalKB = (originalFileSize / 1024).toFixed(2);
  const currentKB = (size / 1024).toFixed(2);

  const reduced = originalFileSize - size;
  const percent = ((reduced / originalFileSize) * 100).toFixed(2);

  stats.innerHTML = `
    📁 Original: ${originalKB} KB<br>
    📦 Current: ${currentKB} KB<br>
    📉 Reduced: ${percent}%<br><br>
    🖼 ${originalWidth}×${originalHeight}px<br>
    📐 ${widthRange.value}×${heightRange.value}px
  `;
}

function calculateSize() {
  const quality = parseFloat(qualityRange.value);

  canvas.toBlob((blob) => {
    updateStats(blob.size);
  }, 'image/jpeg', quality);
}

// 🔥 EVENTS (NEW SYNC FEATURE)
widthRange.addEventListener('input', () => {
  widthInput.value = widthRange.value;
  drawImage();
});

heightRange.addEventListener('input', () => {
  heightInput.value = heightRange.value;
  drawImage();
});

widthInput.addEventListener('input', syncValues);
heightInput.addEventListener('input', syncValues);

qualityRange.addEventListener('input', drawImage);

// 📥 download
downloadBtn.addEventListener('click', () => {
  const name = fileNameInput.value || "compressed-image";
  const quality = parseFloat(qualityRange.value);

  canvas.toBlob((blob) => {
    const link = document.createElement('a');
    link.download = name + ".jpg";
    link.href = URL.createObjectURL(blob);
    link.click();
  }, 'image/jpeg', quality);
});