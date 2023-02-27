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
declare class Config implements BaseConfig {
    audio?: HTMLAudioElement;
    canvas?: HTMLCanvasElement;
    audioCtx?: AudioContext;
    canvasCtx?: CanvasRenderingContext2D;
    audioByteData?: Uint8Array;
    source?: MediaElementAudioSourceNode;
    analyser?: AnalyserNode;
    gradient?: CanvasGradient;
    fillStyle?: (string | CanvasGradient | CanvasPattern);
    fftSize: number;
    circleRadius: number;
    barWidth: number;
    barMinHeight: number;
    barCount: number;
    useDataAvg: boolean;
    useDataAcoustic: boolean;
    protected raf: number;
    protected isInit: boolean;
    protected AudioContext: any;
    constructor(params?: BaseConfig);
}
export { BaseConfig, Config, };
