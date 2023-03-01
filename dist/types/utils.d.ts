declare const _default: {
    roundedRect: (canvasCtx: CanvasRenderingContext2D | null, x: number, y: number, width: number, height: number, radius: number) => void;
    getAudioDataArray: (audioByteData: Uint8Array, barCount: number, useDataAcoustic: boolean, useDataAverage: boolean) => {
        step: number;
        audioDataArray: Uint8Array;
        audioDataArrayStep: Uint8Array;
    };
};
export default _default;
