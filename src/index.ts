"use strict";

/**
 * Audio to Canvas Animation
 */
export class AudioCanvas {
    public audio: HTMLAudioElement;
    public canvas: HTMLCanvasElement;
    public audioCtx?: AudioContext;
    public canvasCtx?: CanvasRenderingContext2D;
    public audioByteData?: Uint8Array;
    public fillStyle?: (string | CanvasGradient | CanvasPattern);
    public fftSize: number = 2048;
    public circleRadius: number = 100;
    public barWidth: number = 5;
    public barMinHeight: number = 1;
    public barCount: number = 100;
    public useDataAvg: boolean = true;
    public useDataAcoustic: boolean = true;


    private raf: number = 0;
    private isInit: boolean = false;
    private source?: MediaElementAudioSourceNode;
    private analyser?: AnalyserNode;
    private gradient?: CanvasGradient;
    private AudioContext = window.AudioContext;
    // private AudioContext = window.AudioContext || window.webkitAudioContext;


    constructor(audio: HTMLAudioElement, canvas: HTMLCanvasElement) {
        this.audio = audio;
        this.canvas = canvas;
    }

    //音频播放事件
    private audioPlay() {
        if (this.isInit) {
            // this.raf = requestAnimationFrame(this.draw);
            this.draw();
        }
    }

    //音频暂停或停止事件
    private audioPause() {
        cancelAnimationFrame(this.raf)
    }

    //初始化连接
    public init(): void {
        if (this.isInit) {
            return;
        }

        try {
            this.canvas.width = 300;
            this.canvas.height = 300;
            this.audioCtx = new this.AudioContext();
            this.canvasCtx = this.canvas.getContext('2d')!;

            this.source = this.audioCtx.createMediaElementSource(this.audio);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = this.fftSize;

            this.audioByteData = new Uint8Array(this.analyser.frequencyBinCount);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);

            //绘制默认样式
            this.gradient = this.canvasCtx?.createLinearGradient(0, -this.circleRadius, 0, -Math.min(this.canvas.width, this.canvas.height) / 2);
            this.gradient?.addColorStop(0, '#0f0');
            this.gradient?.addColorStop(0.5, '#ff0');
            this.gradient?.addColorStop(1, '#f00');

            this.audio.addEventListener('play', this.audioPlay.bind(this), false);
            this.audio.addEventListener('pause', this.audioPause.bind(this), false);

            this.isInit = true;
        } catch (error) {
            console.log('error :>> ', error || 'init error');
        }
    }

    // canvas绘制圆角矩形
    private roundedRect(canvasCtx: (CanvasRenderingContext2D | null), x: number, y: number, width: number, height: number, radius: number): void {
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

    // 绘制
    private draw(): void {
        if (!this.isInit) {
            return;
        }
        this.raf = requestAnimationFrame(this.draw.bind(this));

        this.analyser?.getByteFrequencyData(this.audioByteData!);

        let audioDataArray: Uint8Array = this.audioByteData!.slice(0, this.audioByteData!.length / 2);
        if (this.useDataAcoustic) {
            const dataArrayReverse = [...audioDataArray].reverse();
            audioDataArray = new Uint8Array([...dataArrayReverse, ...audioDataArray])
        }

        var step = Math.round(audioDataArray.length / this.barCount);

        const { width, height } = this.canvas;
        this.canvasCtx?.clearRect(0, 0, width, height);
        this.canvasCtx?.save();     //保存初始状态
        this.canvasCtx?.translate(width / 2, height / 2);
        this.canvasCtx!.fillStyle = this.fillStyle || this.gradient!;

        for (let i = 0; i < this.barCount; i++) {

            let data = audioDataArray[i * step];  //<256
            if (this.useDataAvg) {
                //使用区域平均值
                const dataStep = audioDataArray.slice(i * step, i * step + step)
                data = dataStep!.reduce((n, m) => n + m) / step;
                if (dataStep.length <= 0) {
                    console.log(1)
                }
            }

            var barHeight = data * (height / 2 - this.circleRadius) / 256 || this.barMinHeight;

            this.canvasCtx?.rotate(2 * Math.PI / this.barCount);
            // ctx.fillRect(-barWidth / 2, -cr - barHeight, barWidth, barHeight);
            this.roundedRect(this.canvasCtx!, -this.barWidth / 2, -this.circleRadius - barHeight, this.barWidth, barHeight, this.barWidth / 2);
        }
        this.canvasCtx?.restore();//恢复初始的状态
    }
}

export default AudioCanvas;