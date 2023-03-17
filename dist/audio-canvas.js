const EffectOptionDefault = {
    circleRadius: 100,
    barWidth: 5,
    barMinHeight: 1,
    barCount: 100,
    canvasOption: { width: 300, height: 300 },
    useDataAverage: true,
    useDataAcoustic: true,
    useEffect: 'default',
    followResize: false,
};
class Config {
    constructor(params) {
        this.fftSize = 2048; //必须是2的幂，最大值，Math.pow(2,15)
        this.effectOptions = [];
        this.raf = 0;
        this.isInit = false;
        Object.assign(this, params);
    }
}

// canvas绘制圆角矩形
const roundedRect = (canvasCtx, x, y, width, height, radius) => {
    canvasCtx.beginPath();
    if (height / 2 < radius) {
        radius = 0;
    }
    if (width > 0 && height > 0) {
        canvasCtx.moveTo(x + radius, y);
        canvasCtx.arcTo(x + width, y, x + width, y + height, radius);
        canvasCtx.arcTo(x + width, y + height, x, y + height, radius);
        canvasCtx.arcTo(x, y + height, x, y, radius);
        canvasCtx.arcTo(x, y, x + radius, y, radius);
    }
    canvasCtx.closePath();
    canvasCtx.fill();
};
let isInit = false;
let buffer = [];
let data = [];
const jumpCricle = (canvasCtx, audioByteData, petal, radius, pole, α) => {
    // const color = color;
    const __rotate = (p, cosα, sinα) => {
        return [p[0] * cosα - p[1] * sinα, p[1] * cosα + p[0] * sinα];
    };
    if (!isInit) {
        const θ = 2 * Math.PI / petal;
        const cosθ = Math.cos(θ);
        const sinθ = Math.sin(θ);
        const h = radius * (4 * (1 - Math.cos(θ / 2))) / (3 * Math.sin(θ / 2));
        const A = [radius, 0];
        const B = [radius, h];
        const C = [radius * cosθ + h * sinθ, radius * sinθ - h * cosθ];
        for (let i = 0, idx = 0; i < petal; ++i, idx += 3) {
            const cosNθ = Math.cos(i * θ + α);
            const sinNθ = Math.sin(i * θ + α);
            data[idx] = __rotate(A, cosNθ, sinNθ);
            data[idx + 1] = __rotate(B, cosNθ, sinNθ);
            data[idx + 2] = __rotate(C, cosNθ, sinNθ);
        }
        data.forEach((v, i) => { buffer[i] = [v[0] + pole[0], v[1] + pole[1]]; });
        buffer[buffer.length] = buffer[0];
        isInit = true;
    }
    // const update = () => {
    for (let i = data.length; i--;) {
        buffer[i][0] = data[i][0] * audioByteData[i] + pole[0];
        buffer[i][1] = data[i][1] * audioByteData[i] + pole[1];
    }
    // }
    // 绘制
    canvasCtx.moveTo(...buffer[0]);
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = 'blue';
    for (let i = 0, idx = 0; i < petal; ++i, idx += 3) {
        const A = buffer[idx];
        const B = buffer[idx + 1];
        const C = buffer[idx + 2];
        const D = buffer[idx + 3];
        canvasCtx.lineTo(...A);
        canvasCtx.bezierCurveTo(...B, ...C, ...D);
        // 标出所有点
        // canvasCtx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 60%, 60%)`;
        // canvasCtx.fillRect(A[0] - 2, A[1] - 2, 4, 4);
        // canvasCtx.fillRect(B[0] - 2, B[1] - 2, 4, 4);
        // canvasCtx.fillRect(C[0] - 2, C[1] - 2, 4, 4);
    }
    canvasCtx.closePath();
    canvasCtx.fillStyle = '#888888';
    canvasCtx.fill();
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
    jumpCricle,
    getAudioDataArray,
};

const drawPI = (base, effectOption) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);
    const { width, height } = effectOption.canvasOption;
    (_b = effectOption.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
    effectOption.gradient = (_c = effectOption.canvasCtx) === null || _c === void 0 ? void 0 : _c.createLinearGradient(0, -effectOption.circleRadius, 0, -Math.min(width, height) / 2);
    (_d = effectOption.gradient) === null || _d === void 0 ? void 0 : _d.addColorStop(0, '#40E0D0');
    (_e = effectOption.gradient) === null || _e === void 0 ? void 0 : _e.addColorStop(0.5, '#FF8C00');
    (_f = effectOption.gradient) === null || _f === void 0 ? void 0 : _f.addColorStop(1, '#FF0080');
    (_g = effectOption.canvasCtx) === null || _g === void 0 ? void 0 : _g.beginPath();
    (_h = effectOption.canvasCtx) === null || _h === void 0 ? void 0 : _h.arc(width / 2, height / 2, effectOption.circleRadius - 5, 0, Math.PI * 2, false);
    effectOption.canvasCtx.strokeStyle = effectOption.gradient;
    (_j = effectOption.canvasCtx) === null || _j === void 0 ? void 0 : _j.closePath();
    (_k = effectOption.canvasCtx) === null || _k === void 0 ? void 0 : _k.stroke();
    (_l = effectOption.canvasCtx) === null || _l === void 0 ? void 0 : _l.save();
    (_m = effectOption.canvasCtx) === null || _m === void 0 ? void 0 : _m.translate(width / 2, height / 2);
    effectOption.canvasCtx.fillStyle = effectOption.fillStyle || effectOption.gradient;
    for (let i = 0; i < effectOption.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = data * (height / 2 - effectOption.circleRadius) / 255 || effectOption.barMinHeight;
        (_o = effectOption.canvasCtx) === null || _o === void 0 ? void 0 : _o.rotate(2 * Math.PI / effectOption.barCount);
        utils.roundedRect(effectOption.canvasCtx, -effectOption.barWidth / 2, -effectOption.circleRadius - barHeight, effectOption.barWidth, barHeight, effectOption.barWidth / 2);
    }
    (_p = effectOption.canvasCtx) === null || _p === void 0 ? void 0 : _p.restore();
};
//绘制柱状图
const drawChart = (base, effectOption) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);
    const { width, height } = effectOption.canvasOption;
    (_b = effectOption.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
    effectOption.gradient = (_c = effectOption.canvasCtx) === null || _c === void 0 ? void 0 : _c.createLinearGradient(0, 0, 0, Math.min(width, height));
    (_d = effectOption.gradient) === null || _d === void 0 ? void 0 : _d.addColorStop(0, '#8360c3');
    (_e = effectOption.gradient) === null || _e === void 0 ? void 0 : _e.addColorStop(0.2, '#8A2387');
    (_f = effectOption.gradient) === null || _f === void 0 ? void 0 : _f.addColorStop(0.4, '#E94057');
    (_g = effectOption.gradient) === null || _g === void 0 ? void 0 : _g.addColorStop(0.6, '#F27121');
    (_h = effectOption.gradient) === null || _h === void 0 ? void 0 : _h.addColorStop(0.8, '#92FE9D');
    (_j = effectOption.gradient) === null || _j === void 0 ? void 0 : _j.addColorStop(1, '#00C9FF');
    effectOption.canvasCtx.fillStyle = effectOption.fillStyle || effectOption.gradient;
    for (let i = 0; i < effectOption.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = (data / 255) * height;
        const x = i * (width - effectOption.barWidth) / (effectOption.barCount - 1);
        const y = height - barHeight;
        (_k = effectOption.canvasCtx) === null || _k === void 0 ? void 0 : _k.fillRect(x, y, effectOption.barWidth, barHeight);
    }
};
// 绘制跳动的圆圈
const drawCircle = (base, effectOption) => {
    // const effectOption = base.effectOptions.get(effectName)!;
    var _a, _b;
    (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);
    const { width, height } = effectOption.canvasOption;
    (_b = effectOption.canvasCtx) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, width, height);
    // base.gradient = base.canvasCtx?.createLinearGradient(0, 0, 0, Math.min(width, height));
    // base.gradient?.addColorStop(0, '#8360c3');
    // base.gradient?.addColorStop(0.2, '#8A2387');
    // base.gradient?.addColorStop(0.4, '#E94057');
    // base.gradient?.addColorStop(0.6, '#F27121');
    // base.gradient?.addColorStop(0.8, '#92FE9D');
    // base.gradient?.addColorStop(1, '#00C9FF');
    // base.canvasCtx!.fillStyle = base.fillStyle || base.gradient!;
    // const len = audioDataArray.length / 2;
    // const barWidth = width / len / 2;
    const scale = [];
    const sample = [];
    const petal = 64;
    const pole = [width / 2, height / 2];
    const radius = height / 2 * .5625;
    const __lerp = (src, dst, coeff) => {
        return src + (dst - src) * coeff;
    };
    const __downsampling = (n = 32) => {
        const length = Math.floor(base.audioByteData.length / n);
        let i, j, idx = 0;
        for (i = 0; i < length; ++i) {
            sample[i] = 0;
            for (j = n; j--; ++idx) {
                sample[i] += base.audioByteData[idx];
            }
            sample[i] /= n;
        }
    };
    const __smooth = (data) => {
        const buffer = [...data];
        const size = 9, part = 4;
        let i, j, k, aver = 0;
        for (i = 0, j = data.length; j < data.length << 1; ++i, ++j) {
            for (k = j - part, aver = 0; k <= j + part; ++k) {
                aver += buffer[k % data.length];
            }
            data[i] = aver / size;
        }
    };
    for (let i = 0; i < petal * 3 / 2; i++) {
        // const data = audioDataArrayStep[i];
        // const barHeight = (data / 255) * height;
        // const x = i * (width - base.barWidth) / (base.barCount - 1);
        // const y = height - barHeight;
        // base.canvasCtx?.fillRect(x, y, base.barWidth, barHeight);
        const data = audioDataArrayStep[i];
        data * (height / 2 - effectOption.circleRadius) / 255 || effectOption.barMinHeight;
        // newArray[i] = 1 + (1.15 - 1) * (data / 255);
        __downsampling(10);
        for (let i = 0; i < petal * 3 / 2; ++i) {
            scale[i] = scale[petal * 3 - i - 1] = __lerp(1, 1.15, sample[i] / 255);
        }
        __smooth(scale);
        utils.jumpCricle(effectOption.canvasCtx, scale, petal, radius, pole, 0);
    }
};
let effectsMap = new Map()
    .set('default', drawPI)
    .set('pi', drawPI)
    .set('chart', drawChart)
    .set('circle', drawCircle);

/**
 * Audio to Canvas Animation
 */
class AudioCanvas extends Config {
    constructor(params) { super(params); }
    //初始化
    init(params) {
        var _a, _b, _c, _d;
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
            this.audioCtx = new AudioContext();
            this.source = (_a = this.audioCtx) === null || _a === void 0 ? void 0 : _a.createMediaElementSource(this.audio);
            this.analyser = (_b = this.audioCtx) === null || _b === void 0 ? void 0 : _b.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.audioByteData = new Uint8Array(this.analyser.frequencyBinCount);
            (_c = this.source) === null || _c === void 0 ? void 0 : _c.connect(this.analyser);
            (_d = this.analyser) === null || _d === void 0 ? void 0 : _d.connect(this.audioCtx.destination);
            //遍历初始化canvas
            for (let index = 0; index < this.effectOptions.length; index++) {
                this.effectOptions[index] = Object.assign({}, EffectOptionDefault, this.effectOptions[index]);
                const effectOption = this.effectOptions[index];
                if (!effectOption.canvas) {
                    console.error('the canvas element is undefined');
                    return;
                }
                effectOption.canvasCtx = effectOption.canvas.getContext('2d');
                Object.assign(effectOption.canvas, effectOption.canvasOption);
            }
            window.addEventListener('resize', this.winResize.bind(this), false);
            this.audio.addEventListener('play', this.audioPlay.bind(this), false);
            this.audio.addEventListener('pause', this.audioPause.bind(this), false);
            this.isInit = true;
        }
        catch (error) {
            console.log('error :>> ', error || 'init error');
        }
    }
    // 页面尺寸变化
    winResize() {
        var _a, _b;
        for (let index = 0; index < this.effectOptions.length; index++) {
            const effectOption = this.effectOptions[index];
            if (effectOption.followResize && effectOption.followResizeElement) {
                effectOption.canvasOption = {
                    width: ((_a = document.querySelector(effectOption.followResizeElement)) === null || _a === void 0 ? void 0 : _a.clientWidth) || effectOption.canvasOption.width,
                    height: ((_b = document.querySelector(effectOption.followResizeElement)) === null || _b === void 0 ? void 0 : _b.clientHeight) || effectOption.canvasOption.height
                };
                Object.assign(effectOption.canvas, effectOption.canvasOption);
            }
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
        for (let index = 0; index < this.effectOptions.length; index++) {
            const effectOption = this.effectOptions[index];
            const fn = effectsMap.get(effectOption.useEffect);
            if (fn) {
                fn(this, effectOption);
            }
        }
        this.raf = requestAnimationFrame(this.draw.bind(this));
    }
}

export { AudioCanvas as default };
