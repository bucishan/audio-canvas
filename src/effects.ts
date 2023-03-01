"use strict";

import { Config } from './config';
import utils from './utils';

const drawPI = (base: Config) => {
    base.analyser?.getByteFrequencyData(base.audioByteData!);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData!, base.barCount, base.useDataAcoustic, base.useDataAverage);
    const { width, height } = base.canvas!;

    base.canvasCtx?.clearRect(0, 0, width, height);
    base.canvasCtx?.save();
    base.canvasCtx?.translate(width / 2, height / 2);
    base.canvasCtx!.fillStyle = base.fillStyle || base.gradient!;

    for (let i = 0; i < base.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = data * (height / 2 - base.circleRadius) / 256 || base.barMinHeight;

        base.canvasCtx?.rotate(2 * Math.PI / base.barCount);
        utils.roundedRect(base.canvasCtx!, -base.barWidth / 2, -base.circleRadius - barHeight, base.barWidth, barHeight, base.barWidth / 2);
    }
    base.canvasCtx?.restore();
}

//绘制柱状图
const drawChart = (base: Config) => {

    base.analyser?.getByteFrequencyData(base.audioByteData!);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData!, base.barCount, base.useDataAcoustic, base.useDataAverage);

    const { width, height } = base.canvas!;
    base.canvasCtx?.clearRect(0, 0, width!, height!);

    base.gradient = base.canvasCtx?.createLinearGradient(0, 0, 0, Math.min(width, height));
    base.gradient?.addColorStop(0, '#8360c3');
    base.gradient?.addColorStop(0.2, '#8A2387');
    base.gradient?.addColorStop(0.4, '#E94057');
    base.gradient?.addColorStop(0.6, '#F27121');
    base.gradient?.addColorStop(0.8, '#92FE9D');
    base.gradient?.addColorStop(1, '#00C9FF');
    base.canvasCtx!.fillStyle = base.fillStyle || base.gradient!;

    // const len = audioDataArray.length / 2;
    // const barWidth = width / len / 2;
    for (let i = 0; i < base.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = (data / 255) * height;

        const x = i * (width - base.barWidth) / (base.barCount - 1);
        const y = height - barHeight;
        base.canvasCtx?.fillRect(x, y, base.barWidth, barHeight);

        // utils.roundedRect(base.canvasCtx!, x, y, base.barWidth, barHeight, base.barWidth / 2);
        // const x1 = i * barWidth + width / 2;
        // const x2 = width / 2 - (i + 1) * barWidth;
        // const y = height - barHeight - 230;
        // ctx.fillRect(x1, y, barWidth - 2, barHeight);
        // ctx.fillRect(x2, y, barWidth - 2, barHeight);
    }
}


let effectsMap = new Map<string, Function>()
    .set('default', drawPI)
    .set('pi', drawPI)
    .set('chart', drawChart);

export {
    drawPI,
    drawChart,
    effectsMap
}