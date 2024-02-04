import { HttpResponseCode } from '@/types'

export class ApplicationError extends Error {
    private readonly _status: Readonly<HttpResponseCode>

    constructor(message: string | undefined, status?: HttpResponseCode) {
        super(message)
        this._status = status ?? 500
    }

    get status() {
        return this._status
    }
}
