import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        plugins: [
            // 使用的插件
            resolve(),
            commonjs(),
            typescript({ tslib: 'ES2015' }),
            babel({
                babelHelpers: 'bundled',
                exclude: "node_modules/**",
                // extensions: '.ts'
                // babelHelpers: true,
            })

        ],
        output: [
            // {
            //     // 自动执行功能，适合作为标签包含。（如果要为应用程序创建捆绑包，则可能需要使用它。“iife”代表“立即调用的函数表达式”<script>"
            //     format: 'iife',
            //     file: 'dist/audio-canvas.iife.js',
            //     name: 'AudioCanvas'
            // },
            {
                // CommonJS，适用于 Node 和其他捆绑器
                format: 'cjs',
                file: 'dist/audio-canvas.cjs.js',
            },
            {
                // 将捆绑包保留为 ES 模块文件，适用于其他捆绑器，并作为标签包含在现代浏览器中（别名：，<script type=module>esmmodule)
                format: 'es',
                file: 'dist/audio-canvas.js',
                name: 'AudioCanvas',
                // exports: 'named'
                // file: 'dist/audio-canvas.esm.js',
            },
            {
                // 通用模块定义，作为 和多合一工作amdcjsiife
                format: 'umd',
                file: 'dist/audio-canvas.umd.js',
                // exports: 'named',
                name: 'AudioCanvas',
                // plugins: [terser()]
            },
        ],
    },
    // {
    //     input:'src/index.ts',
    //     plugins: [dts()],
    //     output: {
    //         format: 'esm',
    //         file: 'dist/types/audio-canvas.d.ts',
    //     },
    // },
];