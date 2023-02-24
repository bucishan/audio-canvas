"use strict";
/**
 * Audio to Canvas Animation
 */
export class AudioCanvas {
    // private AudioContext = window.AudioContext || window.webkitAudioContext;
    constructor(audio, canvas) {
        this.fftSize = 2048;
        this.circleRadius = 100;
        this.barWidth = 5;
        this.barMinHeight = 1;
        this.barCount = 100;
        this.useDataAvg = true;
        this.useDataAcoustic = true;
        this.raf = 0;
        this.isInit = false;
        this.AudioContext = window.AudioContext;
        this.audio = audio;
        this.canvas = canvas;
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
    //初始化连接
    init() {
        var _a, _b, _c, _d;
        if (this.isInit) {
            return;
        }
        try {
            this.canvas.width = 300;
            this.canvas.height = 300;
            this.audioCtx = new this.AudioContext();
            this.canvasCtx = this.canvas.getContext('2d');
            this.source = this.audioCtx.createMediaElementSource(this.audio);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.audioByteData = new Uint8Array(this.analyser.frequencyBinCount);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
            //绘制默认样式
            this.gradient = (_a = this.canvasCtx) === null || _a === void 0 ? void 0 : _a.createLinearGradient(0, -this.circleRadius, 0, -Math.min(this.canvas.width, this.canvas.height) / 2);
            (_b = this.gradient) === null || _b === void 0 ? void 0 : _b.addColorStop(0, '#0f0');
            (_c = this.gradient) === null || _c === void 0 ? void 0 : _c.addColorStop(0.5, '#ff0');
            (_d = this.gradient) === null || _d === void 0 ? void 0 : _d.addColorStop(1, '#f00');
            this.audio.addEventListener('play', this.audioPlay.bind(this), false);
            this.audio.addEventListener('pause', this.audioPause.bind(this), false);
            this.isInit = true;
        }
        catch (error) {
            console.log('error :>> ', error || 'init error');
        }
    }
    // canvas绘制圆角矩形
    roundedRect(canvasCtx, x, y, width, height, radius) {
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
    }
    // 绘制
    draw() {
        var _a, _b, _c, _d, _e, _f;
        if (!this.isInit) {
            return;
        }
        this.raf = requestAnimationFrame(this.draw.bind(this));
        (_a = this.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(this.audioByteData);
        let audioDataArray = this.audioByteData.slice(0, this.audioByteData.length / 2);
        if (this.useDataAcoustic) {
            const dataArrayReverse = [...audioDataArray].reverse();
            audioDataArray = new Uint8Array([...dataArrayReverse, ...audioDataArray]);
        }
        var step = Math.round(audioDataArray.length / this.barCount);
        const { width, height } = this.canvas;
        (_b = this.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
        (_c = this.canvasCtx) === null || _c === void 0 ? void 0 : _c.save(); //保存初始状态
        (_d = this.canvasCtx) === null || _d === void 0 ? void 0 : _d.translate(width / 2, height / 2);
        this.canvasCtx.fillStyle = this.fillStyle || this.gradient;
        for (let i = 0; i < this.barCount; i++) {
            let data = audioDataArray[i * step]; //<256
            if (this.useDataAvg) {
                //使用区域平均值
                const dataStep = audioDataArray.slice(i * step, i * step + step);
                data = dataStep.reduce((n, m) => n + m) / step;
                if (dataStep.length <= 0) {
                    console.log(1);
                }
            }
            var barHeight = data * (height / 2 - this.circleRadius) / 256 || this.barMinHeight;
            (_e = this.canvasCtx) === null || _e === void 0 ? void 0 : _e.rotate(2 * Math.PI / this.barCount);
            // ctx.fillRect(-barWidth / 2, -cr - barHeight, barWidth, barHeight);
            this.roundedRect(this.canvasCtx, -this.barWidth / 2, -this.circleRadius - barHeight, this.barWidth, barHeight, this.barWidth / 2);
        }
        (_f = this.canvasCtx) === null || _f === void 0 ? void 0 : _f.restore(); //恢复初始的状态
    }
}
export default AudioCanvas;
