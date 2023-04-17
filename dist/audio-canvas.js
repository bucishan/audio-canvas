const EffectOptionDefault = {
    circleRadius: 100,
    barWidth: 5,
    barMinHeight: 1,
    barCount: 100,
    canvasOption: { width: 300, height: 300 },
    useDataAverage: true,
    useDataAcoustic: true,
    useEffect: 'default',
    effectOnlyHead: false,
    effectRaindrop: false,
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

// canvas 绘制柱子
const drawStick = (canvasCtx, x, y, width, height, radius, onlyTop = false) => {
    canvasCtx.beginPath();
    if (height / 2 < radius) {
        radius = height / 2;
        // radius = 0;
    }
    if (width > 0 && height > 0) {
        canvasCtx.moveTo(x + radius, y);
        canvasCtx.arcTo(x + width, y, x + width, y + height, radius);
        // canvasCtx.arcTo(x + width, y + height, x, y + height, radius);
        if (onlyTop) {
            canvasCtx.lineTo(x + width, y + height);
            canvasCtx.lineTo(x, y + height);
        }
        else {
            canvasCtx.arcTo(x + width, y + height, x, y + height, radius);
            canvasCtx.arcTo(x, y + height, x, y, radius);
        }
        canvasCtx.arcTo(x, y, x + radius, y, radius);
    }
    canvasCtx.closePath();
    canvasCtx.fill();
};
// 倒雨滴
const raindrop = (canvasCtx, x, y, width, height, radius) => {
    canvasCtx.beginPath();
    if (height / 2 < radius) {
        radius = height / 2;
    }
    if (width > 0 && height > 0) {
        canvasCtx.moveTo(x + radius, y);
        canvasCtx.arcTo(x + width, y, x + width, y + height, radius);
        canvasCtx.lineTo(x + radius, y + height);
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
    const audioDataArray = audioByteData.slice(0, audioByteData.length / 3);
    const getBarCount = useDataAcoustic ? barCount / 2 : barCount;
    const step = Math.floor(audioDataArray.length / getBarCount);
    // 按跨度返回数组
    let audioDataArrayStep = new Uint8Array(barCount);
    let audioDataArrayStepTemp = new Uint8Array(getBarCount);
    let index = 0;
    let sum = 0;
    for (let i = 0; i < audioDataArray.length; i++) {
        const value = audioDataArray[i];
        if (useDataAverage) {
            if ((i + 1) % step === 0) {
                audioDataArrayStepTemp[index] = sum / step;
                sum = 0;
                index++;
            }
            else {
                sum += value;
            }
        }
        else {
            if (i === 0 || (i + 1) % step === 0) {
                audioDataArrayStepTemp[index] = value;
                index++;
            }
        }
    }
    if (useDataAcoustic) {
        const dataArrayReverse = [...audioDataArrayStepTemp].reverse();
        audioDataArrayStep = new Uint8Array([...dataArrayReverse, ...audioDataArrayStepTemp]);
    }
    else {
        audioDataArrayStep = audioDataArrayStepTemp;
    }
    return {
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
    drawStick,
    raindrop,
    jumpCricle,
    getAudioDataArray,
};

const drawPI = (base, effectOption) => {
    var _a, _b, _c, _d;
    (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);
    const { width, height } = effectOption.canvasOption;
    const ctx = effectOption.canvasCtx;
    ctx.clearRect(0, 0, width, height);
    effectOption.gradient = ctx.createLinearGradient(0, -effectOption.circleRadius, 0, -Math.min(width, height) / 2);
    (_b = effectOption.gradient) === null || _b === void 0 ? void 0 : _b.addColorStop(0, '#40E0D0');
    (_c = effectOption.gradient) === null || _c === void 0 ? void 0 : _c.addColorStop(0.5, '#FF8C00');
    (_d = effectOption.gradient) === null || _d === void 0 ? void 0 : _d.addColorStop(1, '#FF0080');
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, effectOption.circleRadius - 5, 0, Math.PI * 2, false);
    ctx.strokeStyle = effectOption.gradient;
    ctx.closePath();
    ctx.stroke();
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.fillStyle = effectOption.fillStyle || effectOption.gradient;
    for (let i = 0; i < effectOption.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = data * (height / 2 - effectOption.circleRadius) / 255 || effectOption.barMinHeight;
        ctx.rotate(2 * Math.PI / effectOption.barCount);
        if (effectOption.effectRaindrop) {
            utils.raindrop(ctx, -effectOption.barWidth / 2, -effectOption.circleRadius - barHeight, effectOption.barWidth, barHeight, effectOption.barWidth / 2);
        }
        else {
            utils.drawStick(ctx, -effectOption.barWidth / 2, -effectOption.circleRadius - barHeight, effectOption.barWidth, barHeight, effectOption.barWidth / 2, effectOption.effectOnlyHead);
        }
    }
    ctx.restore();
};
//绘制柱状图
const drawChart = (base, effectOption) => {
    var _a, _b, _c, _d, _e, _f, _g;
    (_a = base.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(base.audioByteData);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);
    const { width, height } = effectOption.canvasOption;
    const ctx = effectOption.canvasCtx;
    ctx.clearRect(0, 0, width, height);
    effectOption.gradient = ctx.createLinearGradient(0, 0, 0, Math.min(width, height));
    (_b = effectOption.gradient) === null || _b === void 0 ? void 0 : _b.addColorStop(0, '#8360c3');
    (_c = effectOption.gradient) === null || _c === void 0 ? void 0 : _c.addColorStop(0.2, '#8A2387');
    (_d = effectOption.gradient) === null || _d === void 0 ? void 0 : _d.addColorStop(0.4, '#E94057');
    (_e = effectOption.gradient) === null || _e === void 0 ? void 0 : _e.addColorStop(0.6, '#F27121');
    (_f = effectOption.gradient) === null || _f === void 0 ? void 0 : _f.addColorStop(0.8, '#92FE9D');
    (_g = effectOption.gradient) === null || _g === void 0 ? void 0 : _g.addColorStop(1, '#00C9FF');
    ctx.fillStyle = effectOption.fillStyle || effectOption.gradient;
    for (let i = 0; i < effectOption.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = (data / 255) * height;
        const x = i * (width - effectOption.barWidth) / (effectOption.barCount - 1);
        const y = height - barHeight;
        // effectOption.canvasCtx?.fillRect(x, y, effectOption.barWidth, barHeight);
        if (effectOption.effectRaindrop) {
            utils.raindrop(ctx, x, y, effectOption.barWidth, barHeight, effectOption.barWidth / 2);
        }
        else {
            utils.drawStick(ctx, x, y, effectOption.barWidth, barHeight, effectOption.barWidth / 2, effectOption.effectOnlyHead);
        }
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

var lastTime = 0;
var vendors = ['webkit', 'moz'];
for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
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
            if (typeof window.AudioContext !== 'undefined') {
                var AudioContext = window.AudioContext;
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
                this.audio.onplay = this.audioPlay.bind(this);
                this.audio.onpause = this.audioPause.bind(this);
                // this.audio.addEventListener('play', this.audioPlay.bind(this), false);
                // this.audio.addEventListener('pause', this.audioPause.bind(this), false);
            }
            else {
                // 不支持 AudioContext
                console.error('error :>> 不支持 AudioContext');
            }
            this.isInit = true;
        }
        catch (error) {
            console.error('error :>> ', error || 'init error');
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
        window.cancelAnimationFrame(this.raf);
    }
    draw() {
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

export { AudioCanvas as default };
