import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import { dts } from 'rollup-plugin-dts'
import external from 'rollup-plugin-peer-deps-external'

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                dir: 'lib',
                format: 'cjs',
                preserveModules: true,
            },
        ],
        external: ['zod', '@relab/rejs'],
        plugins: [
            del({ targets: 'lib/*' }),
            external(),
            json(),
            resolve(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' }),
            terser({
                compress: {
                    directives: false,
                },
            }),
        ],
    },
    {
        input: 'lib/@types/index.d.ts',
        output: [
            {
                file: 'lib/index.d.ts',
                format: 'cjs',
                name: 'types',
            },
        ],
        plugins: [
            dts({
                tsconfig: './tsconfig.json',
                compilerOptions: {
                    paths: {
                        "@/types": ["./lib/@types"]
                    }
                }
            }),
            del({ targets: 'lib/@types', hook: 'buildEnd' })
        ],
    },
]
