'use strict';

class Config {
    constructor(params) {
        this.fftSize = 2048;
        this.circleRadius = 100;
        this.barWidth = 5;
        this.barMinHeight = 1;
        this.barCount = 100;
        this.canvasOption = {};
        this.useDataAvg = true;
        this.useDataAcoustic = true;
        this.raf = 0;
        this.isInit = false;
        this.AudioContext = window.AudioContext;
        Object.assign(this, params);
    }
}

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
var utils = {
    roundedRect
};

// const config = new Config();
const drawPI = (base) => {
    var _a, _b, _c, _d, _e, _f;
    (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
    let audioDataArray = base.audioByteData.slice(0, base.audioByteData.length / 2);
    if (base.useDataAcoustic) {
        const dataArrayReverse = [...audioDataArray].reverse();
        audioDataArray = new Uint8Array([...dataArrayReverse, ...audioDataArray]);
    }
    var step = Math.round(audioDataArray.length / base.barCount);
    const { width, height } = base.canvas;
    (_b = base.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
    (_c = base.canvasCtx) === null || _c === void 0 ? void 0 : _c.save(); //保存初始状态
    (_d = base.canvasCtx) === null || _d === void 0 ? void 0 : _d.translate(width / 2, height / 2);
    base.canvasCtx.fillStyle = base.fillStyle || base.gradient;
    for (let i = 0; i < base.barCount; i++) {
        let data = audioDataArray[i * step]; //<256
        if (base.useDataAvg) {
            //使用区域平均值
            const dataStep = audioDataArray.slice(i * step, i * step + step);
            data = dataStep.reduce((n, m) => n + m) / step;
            if (dataStep.length <= 0) {
                console.log(1);
            }
        }
        var barHeight = data * (height / 2 - base.circleRadius) / 256 || base.barMinHeight;
        (_e = base.canvasCtx) === null || _e === void 0 ? void 0 : _e.rotate(2 * Math.PI / base.barCount);
        utils.roundedRect(base.canvasCtx, -base.barWidth / 2, -base.circleRadius - barHeight, base.barWidth, barHeight, base.barWidth / 2);
    }
    (_f = base.canvasCtx) === null || _f === void 0 ? void 0 : _f.restore(); //恢复初始的状态
};

/**
 * Audio to Canvas Animation
 */
class AudioCanvas extends Config {
    constructor(params) { super(params); }
    //初始化
    init(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // 合并函数
        Object.assign(this, params);
        if (this.isInit) {
            return;
        }
        if (!this.canvas) {
            console.error('the canvas element is undefined');
            return;
        }
        if (!this.audio) {
            console.error('the audio element is undefined');
            return;
        }
        try {
            const co = this.canvasOption;
            this.canvas.width = (_a = co.width) !== null && _a !== void 0 ? _a : 300;
            this.canvas.height = (_b = co.height) !== null && _b !== void 0 ? _b : 300;
            this.audioCtx = new this.AudioContext();
            this.canvasCtx = this.canvas.getContext('2d');
            this.source = (_c = this.audioCtx) === null || _c === void 0 ? void 0 : _c.createMediaElementSource(this.audio);
            this.analyser = (_d = this.audioCtx) === null || _d === void 0 ? void 0 : _d.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.audioByteData = new Uint8Array(this.analyser.frequencyBinCount);
            (_e = this.source) === null || _e === void 0 ? void 0 : _e.connect(this.analyser);
            (_f = this.analyser) === null || _f === void 0 ? void 0 : _f.connect(this.audioCtx.destination);
            //绘制默认样式
            this.gradient = (_g = this.canvasCtx) === null || _g === void 0 ? void 0 : _g.createLinearGradient(0, -this.circleRadius, 0, -Math.min(this.canvas.width, this.canvas.height) / 2);
            (_h = this.gradient) === null || _h === void 0 ? void 0 : _h.addColorStop(0, '#0f0');
            (_j = this.gradient) === null || _j === void 0 ? void 0 : _j.addColorStop(0.5, '#ff0');
            (_k = this.gradient) === null || _k === void 0 ? void 0 : _k.addColorStop(1, '#f00');
            this.audio.addEventListener('play', this.audioPlay.bind(this), false);
            this.audio.addEventListener('pause', this.audioPause.bind(this), false);
            this.isInit = true;
        }
        catch (error) {
            console.log('error :>> ', error || 'init error');
        }
    }
    //音频播放事件
    audioPlay() {
        if (this.isInit) {
            // this.raf = requestAnimationFrame(this.draw);
            this.draw();
        }
    }
    //音频暂停或停止事件
    audioPause() {
        cancelAnimationFrame(this.raf);
    }
    draw() {
        drawPI(this);
        this.raf = requestAnimationFrame(this.draw.bind(this));
    }
}

module.exports = AudioCanvas;
