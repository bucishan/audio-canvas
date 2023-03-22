"use strict";

import { Config, EffectOption } from './config';
import utils from './utils';

const drawPI = (base: Config, effectOption: EffectOption) => {

    base.analyser?.getByteFrequencyData(base.audioByteData!);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData!, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);
    const { width, height } = effectOption.canvasOption;

    effectOption.canvasCtx?.clearRect(0, 0, width, height);

    effectOption.gradient = effectOption.canvasCtx?.createLinearGradient(0, -effectOption.circleRadius, 0, -Math.min(width, height) / 2);
    effectOption.gradient?.addColorStop(0, '#40E0D0');
    effectOption.gradient?.addColorStop(0.5, '#FF8C00');
    effectOption.gradient?.addColorStop(1, '#FF0080');
    effectOption.canvasCtx?.beginPath();

    effectOption.canvasCtx?.arc(width / 2, height / 2, effectOption.circleRadius - 5, 0, Math.PI * 2, false);
    effectOption.canvasCtx!.strokeStyle = effectOption.gradient!;
    effectOption.canvasCtx?.closePath();
    effectOption.canvasCtx?.stroke();

    effectOption.canvasCtx?.save();
    effectOption.canvasCtx?.translate(width / 2, height / 2);

    effectOption.canvasCtx!.fillStyle = effectOption.fillStyle || effectOption.gradient!;

    for (let i = 0; i < effectOption.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = data * (height / 2 - effectOption.circleRadius) / 255 || effectOption.barMinHeight;

        effectOption.canvasCtx?.rotate(2 * Math.PI / effectOption.barCount);
        if (effectOption.effectRaindrop) {
            utils.raindrop(effectOption.canvasCtx!, -effectOption.barWidth / 2, -effectOption.circleRadius - barHeight, effectOption.barWidth, barHeight, effectOption.barWidth / 2);
        } else {
            utils.drawStick(effectOption.canvasCtx!, -effectOption.barWidth / 2, -effectOption.circleRadius - barHeight, effectOption.barWidth, barHeight, effectOption.barWidth / 2, effectOption.effectOnlyHead);
        }
    }
    effectOption.canvasCtx?.restore();
}

//绘制柱状图
const drawChart = (base: Config, effectOption: EffectOption) => {

    base.analyser?.getByteFrequencyData(base.audioByteData!);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData!, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);

    const { width, height } = effectOption.canvasOption;
    effectOption.canvasCtx?.clearRect(0, 0, width, height);

    effectOption.gradient = effectOption.canvasCtx?.createLinearGradient(0, 0, 0, Math.min(width, height));
    effectOption.gradient?.addColorStop(0, '#8360c3');
    effectOption.gradient?.addColorStop(0.2, '#8A2387');
    effectOption.gradient?.addColorStop(0.4, '#E94057');
    effectOption.gradient?.addColorStop(0.6, '#F27121');
    effectOption.gradient?.addColorStop(0.8, '#92FE9D');
    effectOption.gradient?.addColorStop(1, '#00C9FF');
    effectOption.canvasCtx!.fillStyle = effectOption.fillStyle || effectOption.gradient!;

    for (let i = 0; i < effectOption.barCount; i++) {
        const data = audioDataArrayStep[i];
        const barHeight = (data / 255) * height;

        const x = i * (width - effectOption.barWidth) / (effectOption.barCount - 1);
        const y = height - barHeight;
        // effectOption.canvasCtx?.fillRect(x, y, effectOption.barWidth, barHeight);
        if (effectOption.effectRaindrop) {
            utils.raindrop(effectOption.canvasCtx!, x, y, effectOption.barWidth, barHeight, effectOption.barWidth / 2);
        } else {
            utils.drawStick(effectOption.canvasCtx!, x, y, effectOption.barWidth, barHeight, effectOption.barWidth / 2, effectOption.effectOnlyHead);
        }
    }
}

// 绘制跳动的圆圈
const drawCircle = (base: Config, effectOption: EffectOption) => {
    // const effectOption = base.effectOptions.get(effectName)!;

    base.analyser?.getByteFrequencyData(base.audioByteData!);
    const { audioDataArrayStep } = utils.getAudioDataArray(base.audioByteData!, effectOption.barCount, effectOption.useDataAcoustic, effectOption.useDataAverage);

    const { width, height } = effectOption.canvasOption;
    effectOption.canvasCtx?.clearRect(0, 0, width, height);


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
    const sample: Array<number> = [];
    const petal = 64;
    const pole: [number, number] = [width / 2, height / 2];
    const radius = height / 2 * .5625;

    const __lerp = (src: number, dst: number, coeff: number) => {
        return src + (dst - src) * coeff;
    }

    const __downsampling = (n: number = 32) => {
        const length = Math.floor(base.audioByteData!.length / n);
        let i, j, idx = 0;
        for (i = 0; i < length; ++i) {
            sample[i] = 0;
            for (j = n; j--; ++idx) {
                sample[i] += base.audioByteData![idx];
            }
            sample[i] /= n;
        }
    }

    const __smooth = (data: Array<number>) => {
        const buffer = [...data];
        const size = 9, part = 4;
        let i, j, k, aver = 0;
        for (i = 0, j = data.length; j < data.length << 1; ++i, ++j) {
            for (k = j - part, aver = 0; k <= j + part; ++k) {
                aver += buffer[k % data.length];
            }
            data[i] = aver / size;
        }
    }

    for (let i = 0; i < petal * 3 / 2; i++) {
        // const data = audioDataArrayStep[i];
        // const barHeight = (data / 255) * height;

        // const x = i * (width - base.barWidth) / (base.barCount - 1);
        // const y = height - barHeight;
        // base.canvasCtx?.fillRect(x, y, base.barWidth, barHeight);

        const data = audioDataArrayStep[i];
        const barHeight = data * (height / 2 - effectOption.circleRadius) / 255 || effectOption.barMinHeight;

        // newArray[i] = 1 + (1.15 - 1) * (data / 255);
        __downsampling(10);
        for (let i = 0; i < petal * 3 / 2; ++i) {
            scale[i] = scale[petal * 3 - i - 1] = __lerp(1, 1.15, sample[i] / 255);
        }
        __smooth(scale);
        utils.jumpCricle(effectOption.canvasCtx!, scale, petal, radius, pole, 0)

    }

}


let effectsMap = new Map<string, Function>()
    .set('default', drawPI)
    .set('pi', drawPI)
    .set('chart', drawChart)
    .set('circle', drawCircle)

export {
    drawPI,
    drawChart,
    drawCircle,
    effectsMap
}