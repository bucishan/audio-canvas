"use strict";
import utils from './utils';
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
export { drawPI };
