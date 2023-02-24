/**
 * Audio to Canvas Animation
 */
export declare class AudioCanvas {
    audio: HTMLAudioElement;
    canvas: HTMLCanvasElement;
    audioCtx?: AudioContext;
    canvasCtx?: CanvasRenderingContext2D;
    audioByteData?: Uint8Array;
    fillStyle?: (string | CanvasGradient | CanvasPattern);
    fftSize: number;
    circleRadius: number;
    barWidth: number;
    barMinHeight: number;
    barCount: number;
    useDataAvg: boolean;
    useDataAcoustic: boolean;
    private raf;
    private isInit;
    private source?;
    private analyser?;
    private gradient?;
    private AudioContext;
    constructor(audio: HTMLAudioElement, canvas: HTMLCanvasElement);
    private audioPlay;
    private audioPause;
    init(): void;
    private roundedRect;
    private draw;
}
