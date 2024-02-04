export type OutputFormatter = {
    mimeType: string
    format: (source: unknown) => unknown
}
