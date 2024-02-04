export const normalizeUrlPath = (path?: string) =>
    path
        ?.replace(/^[\\/]+/g, '')
        .replace(/[\\/]+$/g, '')
        .replace(/[\\/]+/g, '/')
