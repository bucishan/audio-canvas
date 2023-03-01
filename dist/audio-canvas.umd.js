(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AudioCanvas = factory());
})(this, (function () { 'use strict';

    class Config {
        constructor(params) {
            this.fftSize = 2048; //必须是2的幂，最大值，Math.pow(2,15)
            this.circleRadius = 100;
            this.barWidth = 5;
            this.barMinHeight = 1;
            this.barCount = 100;
            this.canvasOption = { width: 300, height: 300 };
            this.useDataAverage = true;
            this.useDataAcoustic = true;
            this.useEffect = 'default';
            this.raf = 0;
            this.isInit = false;
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
    /**
     *
     * 获取处理后Audio输出数据
     *
     * @param audioByteData 原始Audio数据
     * @param barCount 展示的数据量，用于计算数据跨度 step
     * @param useDataAcoustic 是否使用数据镜像
     * @param useDataAverage 是否使用跨度平均值
     *
     */
    const getAudioDataArray = (audioByteData, barCount, useDataAcoustic, useDataAverage) => {
        let audioDataArray = audioByteData.slice(0, audioByteData.length / 2);
        if (useDataAcoustic) {
            const dataArrayReverse = [...audioDataArray].reverse();
            audioDataArray = new Uint8Array([...dataArrayReverse, ...audioDataArray]);
        }
        const step = Math.round(audioDataArray.length / barCount);
        // 按跨度返回数组
        let audioDataArrayStep = new Uint8Array(barCount);
        let index = 0;
        let sum = 0;
        for (let i = 0; i < audioDataArray.length; i++) {
            const value = audioDataArray[i];
            if (useDataAverage) {
                if ((i + 1) % step === 0) {
                    audioDataArrayStep[index] = sum / step;
                    sum = 0;
                    index++;
                }
                else {
                    sum += value;
                }
            }
            else {
                if (i === 0 || (i + 1) % step === 0) {
                    audioDataArrayStep[index] = value;
                    index++;
                }
            }
        }
        return {
            step,
            audioDataArray,
            audioDataArrayStep,
        };
    };
    // 获取平均值
    // const getAudioData = (audioDataArray: Uint8Array, useDataAvg: boolean, index: number, step: number): number => {
    //     const findIndex = index * step;
    //     let data = audioDataArray[findIndex];  //<256
    //     if (useDataAvg) {
    //         //使用区域平均值
    //         const dataStep = audioDataArray.slice(findIndex, findIndex + step)
    //         data = dataStep.reduce((n, m) => n + m) / step;
    //     }
    //     return data
    // }
    var utils = {
        roundedRect,
        getAudioDataArray,
    };

    const drawPI = (base) => {
        var _a, _b, _c, _d, _e, _f;
        (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
        const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, base.barCount, base.useDataAcoustic, base.useDataAverage);
        const { width, height } = base.canvas;
        (_b = base.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
        (_c = base.canvasCtx) === null || _c === void 0 ? void 0 : _c.save();
        (_d = base.canvasCtx) === null || _d === void 0 ? void 0 : _d.translate(width / 2, height / 2);
        base.canvasCtx.fillStyle = base.fillStyle || base.gradient;
        for (let i = 0; i < base.barCount; i++) {
            const data = audioDataArrayStep[i];
            const barHeight = data * (height / 2 - base.circleRadius) / 256 || base.barMinHeight;
            (_e = base.canvasCtx) === null || _e === void 0 ? void 0 : _e.rotate(2 * Math.PI / base.barCount);
            utils.roundedRect(base.canvasCtx, -base.barWidth / 2, -base.circleRadius - barHeight, base.barWidth, barHeight, base.barWidth / 2);
        }
        (_f = base.canvasCtx) === null || _f === void 0 ? void 0 : _f.restore();
    };
    //绘制柱状图
    const drawChart = (base) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
        const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, base.barCount, base.useDataAcoustic, base.useDataAverage);
        const { width, height } = base.canvas;
        (_b = base.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
        base.gradient = (_c = base.canvasCtx) === null || _c === void 0 ? void 0 : _c.createLinearGradient(0, 0, 0, Math.min(width, height));
        (_d = base.gradient) === null || _d === void 0 ? void 0 : _d.addColorStop(0, '#8360c3');
        (_e = base.gradient) === null || _e === void 0 ? void 0 : _e.addColorStop(0.2, '#8A2387');
        (_f = base.gradient) === null || _f === void 0 ? void 0 : _f.addColorStop(0.4, '#E94057');
        (_g = base.gradient) === null || _g === void 0 ? void 0 : _g.addColorStop(0.6, '#F27121');
        (_h = base.gradient) === null || _h === void 0 ? void 0 : _h.addColorStop(0.8, '#92FE9D');
        (_j = base.gradient) === null || _j === void 0 ? void 0 : _j.addColorStop(1, '#00C9FF');
        base.canvasCtx.fillStyle = base.fillStyle || base.gradient;
        // const len = audioDataArray.length / 2;
        // const barWidth = width / len / 2;
        for (let i = 0; i < base.barCount; i++) {
            const data = audioDataArrayStep[i];
            const barHeight = (data / 255) * height;
            const x = i * (width - base.barWidth) / (base.barCount - 1);
            const y = height - barHeight;
            (_k = base.canvasCtx) === null || _k === void 0 ? void 0 : _k.fillRect(x, y, base.barWidth, barHeight);
            // utils.roundedRect(base.canvasCtx!, x, y, base.barWidth, barHeight, base.barWidth / 2);
            // const x1 = i * barWidth + width / 2;
            // const x2 = width / 2 - (i + 1) * barWidth;
            // const y = height - barHeight - 230;
            // ctx.fillRect(x1, y, barWidth - 2, barHeight);
            // ctx.fillRect(x2, y, barWidth - 2, barHeight);
        }
    };
    let effectsMap = new Map()
        .set('default', drawPI)
        .set('pi', drawPI)
        .set('chart', drawChart);

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
                Object.assign(this.canvas, this.canvasOption);
                this.audioCtx = new AudioContext();
                this.canvasCtx = this.canvas.getContext('2d');
                this.source = (_a = this.audioCtx) === null || _a === void 0 ? void 0 : _a.createMediaElementSource(this.audio);
                this.analyser = (_b = this.audioCtx) === null || _b === void 0 ? void 0 : _b.createAnalyser();
                this.analyser.fftSize = this.fftSize;
                this.audioByteData = new Uint8Array(this.analyser.frequencyBinCount);
                (_c = this.source) === null || _c === void 0 ? void 0 : _c.connect(this.analyser);
                (_d = this.analyser) === null || _d === void 0 ? void 0 : _d.connect(this.audioCtx.destination);
                //绘制默认样式
                this.gradient = (_e = this.canvasCtx) === null || _e === void 0 ? void 0 : _e.createLinearGradient(0, -this.circleRadius, 0, -Math.min(this.canvas.width, this.canvas.height) / 2);
                (_f = this.gradient) === null || _f === void 0 ? void 0 : _f.addColorStop(0, '#40E0D0');
                (_g = this.gradient) === null || _g === void 0 ? void 0 : _g.addColorStop(0.5, '#FF8C00');
                (_h = this.gradient) === null || _h === void 0 ? void 0 : _h.addColorStop(1, '#FF0080');
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
            const fn = effectsMap.get(this.useEffect);
            if (fn) {
                fn(this);
            }
            this.raf = requestAnimationFrame(this.draw.bind(this));
        }
    }

    return AudioCanvas;

}));
