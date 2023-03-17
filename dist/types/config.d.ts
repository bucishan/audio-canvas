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
declare const EffectOptionDefault: EffectOption;
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
declare class Config implements BaseConfig {
    audio?: HTMLAudioElement;
    audioCtx?: AudioContext;
    audioByteData?: Uint8Array;
    source?: MediaElementAudioSourceNode;
    analyser?: AnalyserNode;
    fftSize: number;
    effectOptions: Array<EffectOption>;
    protected raf: number;
    protected isInit: boolean;
    constructor(params?: BaseConfig);
}
export { BaseConfig, Config, EffectOption, EffectOptionDefault, };
