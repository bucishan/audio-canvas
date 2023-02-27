"use strict";

import { Config } from './config';
import utils from './utils';
// const config = new Config();
const drawPI = (base: Config) => {

    base.analyser?.getByteFrequencyData(base.audioByteData!);

    let audioDataArray: Uint8Array = base.audioByteData!.slice(0, base.audioByteData!.length / 2);
    if (base.useDataAcoustic) {
        const dataArrayReverse = [...audioDataArray].reverse();
        audioDataArray = new Uint8Array([...dataArrayReverse, ...audioDataArray])
    }

    var step = Math.round(audioDataArray.length / base.barCount);

    const { width, height } = base.canvas!;
    base.canvasCtx?.clearRect(0, 0, width, height);
    base.canvasCtx?.save();     //保存初始状态
    base.canvasCtx?.translate(width / 2, height / 2);
    base.canvasCtx!.fillStyle = base.fillStyle || base.gradient!;

    for (let i = 0; i < base.barCount; i++) {

        let data = audioDataArray[i * step];  //<256
        if (base.useDataAvg) {
            //使用区域平均值
            const dataStep = audioDataArray.slice(i * step, i * step + step)
            data = dataStep!.reduce((n, m) => n + m) / step;
            if (dataStep.length <= 0) {
                console.log(1)
            }
        }

        var barHeight = data * (height / 2 - base.circleRadius) / 256 || base.barMinHeight;

        base.canvasCtx?.rotate(2 * Math.PI / base.barCount);
        utils.roundedRect(base.canvasCtx!, -base.barWidth / 2, -base.circleRadius - barHeight, base.barWidth, barHeight, base.barWidth / 2);
    }
    base.canvasCtx?.restore();//恢复初始的状态
}

export {
    drawPI
}