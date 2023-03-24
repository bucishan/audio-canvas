declare const _default: {
    drawStick: (canvasCtx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, onlyTop?: boolean) => void;
    raindrop: (canvasCtx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => void;
    jumpCricle: (canvasCtx: CanvasRenderingContext2D, audioByteData: number[], petal: number, radius: number, pole: [number, number], α: number) => void;
    getAudioDataArray: (audioByteData: Uint8Array, barCount: number, useDataAcoustic: boolean, useDataAverage: boolean) => {
        audioDataArray: Uint8Array;
        audioDataArrayStep: Uint8Array;
    };
};
export default _default;
