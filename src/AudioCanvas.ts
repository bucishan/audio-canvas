"use strict";

import { Config, BaseConfig } from './config';
import { drawPI } from './effects'

/**
 * Audio to Canvas Animation
 */
class AudioCanvas extends Config {

    constructor(params?: BaseConfig) { super(params) }

    //初始化
    public init(params?: BaseConfig): void {
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
            this.canvasCtx = this.canvas.getContext('2d')!;

            this.source = this.audioCtx?.createMediaElementSource(this.audio);
            this.analyser = this.audioCtx?.createAnalyser();
            this.analyser!.fftSize = this.fftSize;

            this.audioByteData = new Uint8Array(this.analyser!.frequencyBinCount);
            this.source?.connect(this.analyser!);
            this.analyser?.connect(this.audioCtx!.destination);

            //绘制默认样式
            this.gradient = this.canvasCtx?.createLinearGradient(0, -this.circleRadius, 0, -Math.min(this.canvas.width, this.canvas.height) / 2);
            this.gradient?.addColorStop(0, '#0f0');
            this.gradient?.addColorStop(0.5, '#ff0');
            this.gradient?.addColorStop(1, '#f00');

            this.audio.addEventListener('play', this.audioPlay.bind(this), false);
            this.audio.addEventListener('pause', this.audioPause.bind(this), false);

            this.isInit = true;
        } catch (error) {
            console.log('error :>> ', error || 'init error');
        }
    }
    //音频播放事件
    private audioPlay() {
        if (this.isInit) {
            // this.raf = requestAnimationFrame(this.draw);
            this.draw();
        }
    }

    //音频暂停或停止事件
    private audioPause() {
        cancelAnimationFrame(this.raf)
    }

    private draw() {
        drawPI(this)
        this.raf = requestAnimationFrame(this.draw.bind(this));
    }
}


export {
    AudioCanvas as default
}