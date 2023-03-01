"use strict";

/**
 * canvas配置属性
 */
interface CanvasOption {
    width: number;
    height: number;
}

/** 
 * 基础配置
*/
interface BaseConfig {
    audio?: HTMLAudioElement;
    canvas?: HTMLCanvasElement;
    audioCtx?: AudioContext;
    canvasCtx?: CanvasRenderingContext2D;
    audioByteData?: Uint8Array;
    source?: MediaElementAudioSourceNode;
    analyser?: AnalyserNode;
    gradient?: CanvasGradient;

    fillStyle?: (string | CanvasGradient | CanvasPattern);
    fftSize?: number;
    circleRadius?: number;
    barWidth?: number;
    barMinHeight?: number;
    barCount?: number;
    canvasOption?: CanvasOption;
    useDataAverage?: boolean;
    useDataAcoustic?: boolean;
    useEffect?: string;

}

class Config implements BaseConfig {
    public audio?: HTMLAudioElement;
    public canvas?: HTMLCanvasElement;
    public audioCtx?: AudioContext;
    public canvasCtx?: CanvasRenderingContext2D;
    public audioByteData?: Uint8Array;
    public source?: MediaElementAudioSourceNode;
    public analyser?: AnalyserNode;
    public gradient?: CanvasGradient;
    public fillStyle?: (string | CanvasGradient | CanvasPattern);

    public fftSize: number = 2048;  //必须是2的幂，最大值，Math.pow(2,15)
    public circleRadius: number = 100;
    public barWidth: number = 5;
    public barMinHeight: number = 1;
    public barCount: number = 100;
    public canvasOption: CanvasOption = { width: 300, height: 300 };
    public useDataAverage: boolean = true;
    public useDataAcoustic: boolean = true;
    public useEffect: string = 'default';

    protected raf: number = 0;
    protected isInit: boolean = false;

    constructor(params?: BaseConfig) {
        Object.assign(this, params);
    }
}

export {
    BaseConfig,
    Config,
    // CanvasOption
}