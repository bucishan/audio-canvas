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
    canvasOption: CanvasOption;
    useDataAverage: boolean;
    useDataAcoustic: boolean;
    useEffect: string;
    protected raf: number;
    protected isInit: boolean;
    constructor(params?: BaseConfig);
}
export { BaseConfig, Config, };
