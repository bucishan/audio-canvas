import { Config, EffectOption } from './config';
declare const drawPI: (base: Config, effectOption: EffectOption) => void;
declare const drawChart: (base: Config, effectOption: EffectOption) => void;
declare const drawCircle: (base: Config, effectOption: EffectOption) => void;
declare let effectsMap: Map<string, Function>;
export { drawPI, drawChart, drawCircle, effectsMap };
