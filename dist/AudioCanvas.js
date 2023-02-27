"use strict";
import { Config } from './config';
import { drawPI } from './effects';
/**
 * Audio to Canvas Animation
 */
class AudioCanvas extends Config {
    constructor(params) { super(params); }
    //初始化
    init(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
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
            this.canvas.width = 300;
            this.canvas.height = 300;
            this.audioCtx = new this.AudioContext();
            this.canvasCtx = this.canvas.getContext('2d');
            this.source = (_a = this.audioCtx) === null || _a === void 0 ? void 0 : _a.createMediaElementSource(this.audio);
            this.analyser = (_b = this.audioCtx) === null || _b === void 0 ? void 0 : _b.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.audioByteData = new Uint8Array(this.analyser.frequencyBinCount);
            (_c = this.source) === null || _c === void 0 ? void 0 : _c.connect(this.analyser);
            (_d = this.analyser) === null || _d === void 0 ? void 0 : _d.connect(this.audioCtx.destination);
            //绘制默认样式
            this.gradient = (_e = this.canvasCtx) === null || _e === void 0 ? void 0 : _e.createLinearGradient(0, -this.circleRadius, 0, -Math.min(this.canvas.width, this.canvas.height) / 2);
            (_f = this.gradient) === null || _f === void 0 ? void 0 : _f.addColorStop(0, '#0f0');
            (_g = this.gradient) === null || _g === void 0 ? void 0 : _g.addColorStop(0.5, '#ff0');
            (_h = this.gradient) === null || _h === void 0 ? void 0 : _h.addColorStop(1, '#f00');
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
export { AudioCanvas as default };
