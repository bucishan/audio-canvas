"use strict";

// canvas绘制圆角矩形
const roundedRect = (canvasCtx: (CanvasRenderingContext2D | null), x: number, y: number, width: number, height: number, radius: number): void => {
    canvasCtx?.beginPath();
    if (Math.max(width, height) / 2 <= radius) {
        radius = height / 2;
    }
    if (width <= 0 || height <= 0) {
        canvasCtx?.arc(x, y, radius, 0, Math.PI * 2);
    } else {
        canvasCtx?.moveTo(x + radius, y);
        canvasCtx?.arcTo(x + width, y, x + width, y + height, radius);
        canvasCtx?.arcTo(x + width, y + height, x, y + height, radius);
        canvasCtx?.arcTo(x, y + height, x, y, radius);
        canvasCtx?.arcTo(x, y, x + radius, y, radius);
    }
    canvasCtx?.closePath();
    canvasCtx?.fill();
}

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
const getAudioDataArray = (audioByteData: Uint8Array, barCount: number, useDataAcoustic: boolean, useDataAverage: boolean)
    : { step: number, audioDataArray: Uint8Array, audioDataArrayStep: Uint8Array } => {

    let audioDataArray = audioByteData.slice(0, audioByteData.length / 2);
    if (useDataAcoustic) {
        const dataArrayReverse = [...audioDataArray].reverse();
        audioDataArray = new Uint8Array([...dataArrayReverse, ...audioDataArray])
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
            } else {
                sum += value;
            }
        } else {
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
}

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

export default {
    roundedRect,
    getAudioDataArray,
}