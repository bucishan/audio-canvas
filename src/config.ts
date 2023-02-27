"use strict";

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
    useDataAvg?: boolean;
    useDataAcoustic?: boolean;

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

    public fftSize: number = 2048;
    public circleRadius: number = 100;
    public barWidth: number = 5;
    public barMinHeight: number = 1;
    public barCount: number = 100;
    public useDataAvg: boolean = true;
    public useDataAcoustic: boolean = true;

    protected raf: number = 0;
    protected isInit: boolean = false;
    protected AudioContext: any = window.AudioContext;

    constructor(params?: BaseConfig) {
        Object.assign(this, params);
    }
}

export {
    BaseConfig,
    Config,
}