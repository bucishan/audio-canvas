"use strict";

/**
 * canvas配置属性
 */
interface CanvasOption {
    width: number;
    height: number;
}

interface EffectOption {
    canvas?: HTMLCanvasElement;
    canvasCtx?: CanvasRenderingContext2D;
    gradient?: CanvasGradient;
    fillStyle?: (string | CanvasGradient | CanvasPattern);
    // fftSize?: number;
    circleRadius: number;
    barWidth: number;
    barMinHeight: number;
    barCount: number;
    canvasOption: CanvasOption;
    useDataAverage: boolean;
    useDataAcoustic: boolean;
    useEffect: string;
    followResize: boolean;
    followResizeElement?: string;
}

const EffectOptionDefault: EffectOption = {
    circleRadius: 100,
    barWidth: 5,
    barMinHeight: 1,
    barCount: 100,
    canvasOption: { width: 300, height: 300 },
    useDataAverage: true,
    useDataAcoustic: true,
    useEffect: 'default',
    followResize: false,
}

/** 
 * 基础配置
*/
interface BaseConfig {
    audio?: HTMLAudioElement;
    audioCtx?: AudioContext;
    audioByteData?: Uint8Array;
    source?: MediaElementAudioSourceNode;
    analyser?: AnalyserNode;
    fftSize?: number;

    effectOptions: Array<EffectOption>;
}

class Config implements BaseConfig {
    public audio?: HTMLAudioElement;
    public audioCtx?: AudioContext;
    public audioByteData?: Uint8Array;
    public source?: MediaElementAudioSourceNode;
    public analyser?: AnalyserNode;
    public fftSize: number = 2048;  //必须是2的幂，最大值，Math.pow(2,15)

    public effectOptions: Array<EffectOption> = []

    protected raf: number = 0;
    protected isInit: boolean = false;

    constructor(params?: BaseConfig) {
        Object.assign(this, params);
    }
}

export {
    BaseConfig,
    Config,
    EffectOption,
    EffectOptionDefault,
}