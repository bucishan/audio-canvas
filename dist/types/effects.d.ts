import { Config } from './config';
declare const drawPI: (base: Config) => void;
declare const drawChart: (base: Config) => void;
declare let effectsMap: Map<string, Function>;
export { drawPI, drawChart, effectsMap };
