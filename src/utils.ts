"use strict";

// canvas 绘制柱子
const drawStick = (canvasCtx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, onlyTop: boolean = false): void => {
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
        } else {
            canvasCtx.arcTo(x + width, y + height, x, y + height, radius);
            canvasCtx.arcTo(x, y + height, x, y, radius);
        }
        canvasCtx.arcTo(x, y, x + radius, y, radius);

    }
    canvasCtx.closePath();
    canvasCtx.fill();
}

// 倒雨滴
const raindrop = (canvasCtx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void => {
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
}

let isInit = false;
let buffer: Array<[number, number]> = [];
let data: Array<[number, number]> = [];
const jumpCricle = (canvasCtx: CanvasRenderingContext2D, audioByteData: Array<number>, petal: number, radius: number, pole: [number, number], α: number): void => {
    // const color = color;


    const __rotate = (p: Array<number>, cosα: number, sinα: number): [number, number] => {
        return [p[0] * cosα - p[1] * sinα, p[1] * cosα + p[0] * sinα];
    }

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
    : { audioDataArray: Uint8Array, audioDataArrayStep: Uint8Array } => {

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
            } else {
                sum += value;
            }
        } else {
            if (i === 0 || (i + 1) % step === 0) {
                audioDataArrayStepTemp[index] = value;
                index++;
            }
        }
    }
    if (useDataAcoustic) {
        const dataArrayReverse = [...audioDataArrayStepTemp].reverse();
        audioDataArrayStep = new Uint8Array([...dataArrayReverse, ...audioDataArrayStepTemp])
    } else {
        audioDataArrayStep = audioDataArrayStepTemp;
    }

    return {
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
    drawStick,
    raindrop,
    jumpCricle,
    getAudioDataArray,
}