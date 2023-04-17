"use strict";

import { Config, BaseConfig, EffectOptionDefault } from './config';
import { effectsMap } from './effects'


var lastTime = 0;
var vendors = ['webkit', 'moz'];
for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    window.requestAnimationFrame = (window as any)[vendors[i] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = (window as any)[vendors[i] + 'CancelAnimationFrame'] || (window as any)[vendors[i] + 'CancelRequestAnimationFrame'];
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
        var currentTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currentTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currentTime + timeToCall);
        }, timeToCall);
        lastTime = currentTime + timeToCall;
        return id;
    };
}
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}


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

        if (!this.audio) {
            console.error('the audio element is undefined');
            return;
        }

        try {

            if (typeof window.AudioContext !== 'undefined') {
                var AudioContext = window.AudioContext;
                this.audioCtx = new AudioContext();

                this.source = this.audioCtx?.createMediaElementSource(this.audio);
                this.analyser = this.audioCtx?.createAnalyser();
                this.analyser!.fftSize = this.fftSize;

                this.audioByteData = new Uint8Array(this.analyser!.frequencyBinCount);
                this.source?.connect(this.analyser!);
                this.analyser?.connect(this.audioCtx!.destination);

                //遍历初始化canvas
                for (let index = 0; index < this.effectOptions.length; index++) {

                    this.effectOptions[index] = Object.assign({}, EffectOptionDefault, this.effectOptions[index]);
                    const effectOption = this.effectOptions[index];

                    if (!effectOption.canvas) {
                        console.error('the canvas element is undefined');
                        return;
                    }

                    effectOption.canvasCtx = effectOption.canvas.getContext('2d')!;

                    Object.assign(effectOption.canvas!, effectOption.canvasOption);
                }
                window.addEventListener('resize', this.winResize.bind(this), false);

                this.audio.onplay = this.audioPlay.bind(this);
                this.audio.onpause = this.audioPause.bind(this);
                // this.audio.addEventListener('play', this.audioPlay.bind(this), false);
                // this.audio.addEventListener('pause', this.audioPause.bind(this), false);
            } else {
                // 不支持 AudioContext
                console.error('error :>> 不支持 AudioContext');
            }
            this.isInit = true;
        } catch (error) {
            console.error('error :>> ', error || 'init error');
        }
    }
    // 页面尺寸变化
    private winResize() {
        for (let index = 0; index < this.effectOptions.length; index++) {
            const effectOption = this.effectOptions[index];
            if (effectOption.followResize && effectOption.followResizeElement) {

                effectOption.canvasOption = {
                    width: document.querySelector(effectOption.followResizeElement)?.clientWidth || effectOption.canvasOption.width,
                    height: document.querySelector(effectOption.followResizeElement)?.clientHeight || effectOption.canvasOption.height
                };
                Object.assign(effectOption.canvas!, effectOption.canvasOption);
            }
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
        window.cancelAnimationFrame(this.raf)
    }

    private draw() {

        for (let index = 0; index < this.effectOptions.length; index++) {
            const effectOption = this.effectOptions[index];
            const fn = effectsMap.get(effectOption.useEffect);
            if (fn) {
                fn(this, effectOption);
            }
        }

        this.raf = window.requestAnimationFrame(this.draw.bind(this));

    }
}


export {
    AudioCanvas as default,
}
