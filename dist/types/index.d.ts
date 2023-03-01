import { Config, BaseConfig } from './config';
/**
 * Audio to Canvas Animation
 */
declare class AudioCanvas extends Config {
    constructor(params?: BaseConfig);
    init(params?: BaseConfig): void;
    private audioPlay;
    private audioPause;
    private draw;
}
export { AudioCanvas as default, };
