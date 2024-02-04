export const parseAcceptHeader = (header: string | undefined) =>
    (header ?? '')
        .split(',')
        .map(x => {
            const [name, params] = x.trim().split(';')

            const param = params?.match(/q\s*=\s*(\d+(\.\d+)?)/i)
            const q = param && param.length > 1 ? Number(param[1]) || 1 : 1

            return {
                name: name.trim().toLowerCase(),
                q,
            }
        })
        .sort((a, b) => b.q - a.q)
        .map(x => x.name)
