'use strict';
const COLOR_SCHEMES = {
    'standard': ['#e50000', '#ff8d00', '#ffee00', '#008121', '#004cff', '#760188'],
    'modern':   ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA'],
    'trans':    ['#5bcffa', '#f5abb9', '#ffffff', '#f5abb9', '#5bcffa'],
    'enby':     ['#b67fdb', '#ffffff', '#478121'],
    'ace':      ['#000000', '#a4a4a4', '#ffffff', '#81047f'],
    'pan':      ['#ff1e8c', '#fed818', '#1fb2fd'],
};
const $ = (selector) => document.querySelector(selector);
const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const scale = $('#scale');
const rotate = $('#rotate');
const download = $('#download');
ctx.resetTransform = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

// Generate color scheme list
(() => {
    const template = $('#color-radio')
    const list = $('#colors');
    Object.keys(COLOR_SCHEMES).forEach((name) => {
        const clone = document.importNode(template.content, true);
        const input = clone.querySelector('input');
        const label = clone.querySelector('label');
        input.value = name;
        input.addEventListener('change', redraw);
        label.appendChild(document.createTextNode(name));
        list.appendChild(clone);
    });
})();


const reader = new FileReader();
const image = new Image();
reader.onload = () => image.src = reader.result;
image.onload = redraw;

$('#file').addEventListener('change', event => {
    reader.readAsDataURL(event.target.files[0])
});
scale.addEventListener('change', redraw);
rotate.addEventListener('change', redraw);

function redraw() {
    const halfWidth = canvas.width / 2;
    // Reset
    ctx.restore();
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rainbow
    const color = $('input[name=color]:checked').value || 'standard';
    const colors = COLOR_SCHEMES[color];
    const radians = rotate.value * Math.PI / 180;
    const rainbowWidth = canvas.width / colors.length;
    const rainbowWidthExtra = rainbowWidth * Math.abs(Math.sin(radians * 2)) * 0.5;

    ctx.translate(halfWidth, halfWidth);
    ctx.rotate(radians);
    ctx.translate(-canvas.width, -canvas.width);
    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width * 2, canvas.width);
        if (i == 0)
            ctx.translate(0,
                halfWidth + rainbowWidth -
                (rainbowWidthExtra * (colors.length - 2) / 2)
            );
        else
            ctx.translate(0, rainbowWidth + rainbowWidthExtra);
    });
    ctx.resetTransform();

    // Draw circluar crop mask
    const MARGIN = 30
    ctx.translate(halfWidth, halfWidth);
    ctx.beginPath()
    ctx.arc(0, 0, halfWidth - MARGIN, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.resetTransform();

    // Draw user's avatar
    const dimension = Math.min(image.width, image.height) * scale.value;
    const xOffset = (image.width - dimension) / 2;
    const yOffset = (image.height - dimension) / 2;
    ctx.drawImage(
        image, xOffset, yOffset, dimension, dimension,
        0, 0, canvas.width, canvas.height
    );

    download.href = canvas.toDataURL();
}

redraw();
