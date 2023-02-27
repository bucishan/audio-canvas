"use strict";
// canvas绘制圆角矩形
const roundedRect = (canvasCtx, x, y, width, height, radius) => {
    canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.beginPath();
    if (Math.max(width, height) / 2 <= radius) {
        radius = height / 2;
    }
    if (width <= 0 || height <= 0) {
        canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.arc(x, y, radius, 0, Math.PI * 2);
    }
    else {
        canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.moveTo(x + radius, y);
        canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.arcTo(x + width, y, x + width, y + height, radius);
        canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.arcTo(x + width, y + height, x, y + height, radius);
        canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.arcTo(x, y + height, x, y, radius);
        canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.arcTo(x, y, x + radius, y, radius);
    }
    canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.closePath();
    canvasCtx === null || canvasCtx === void 0 ? void 0 : canvasCtx.fill();
};
export default {
    roundedRect
};
