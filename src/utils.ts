"use strict";

// canvas绘制圆角矩形
const roundedRect = (canvasCtx: (CanvasRenderingContext2D | null), x: number, y: number, width: number, height: number, radius: number): void => {
    canvasCtx?.beginPath();
    if (Math.max(width, height) / 2 <= radius) {
        radius = height / 2;
    }
    if (width <= 0 || height <= 0) {
        canvasCtx?.arc(x, y, radius, 0, Math.PI * 2);
    } else {
        canvasCtx?.moveTo(x + radius, y);
        canvasCtx?.arcTo(x + width, y, x + width, y + height, radius);
        canvasCtx?.arcTo(x + width, y + height, x, y + height, radius);
        canvasCtx?.arcTo(x, y + height, x, y, radius);
        canvasCtx?.arcTo(x, y, x + radius, y, radius);
    }
    canvasCtx?.closePath();
    canvasCtx?.fill();
}

export default {
    roundedRect
}