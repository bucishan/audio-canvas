"use strict";
class Config {
    constructor(params) {
        this.fftSize = 2048;
        this.circleRadius = 100;
        this.barWidth = 5;
        this.barMinHeight = 1;
        this.barCount = 100;
        this.useDataAvg = true;
        this.useDataAcoustic = true;
        this.raf = 0;
        this.isInit = false;
        this.AudioContext = window.AudioContext;
        Object.assign(this, params);
    }
}
export { Config, };
