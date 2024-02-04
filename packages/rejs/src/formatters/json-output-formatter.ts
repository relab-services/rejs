import { OutputFormatter } from '@/types'

export const jsonOutputFormatter: OutputFormatter = {
    mimeType: 'application/json',
    format: source => {
        return typeof source === 'number' ? JSON.stringify(source) : source
    },
}
