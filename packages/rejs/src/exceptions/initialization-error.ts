export class InitializationError extends Error {
    private readonly _errors: Readonly<unknown[]> = []

    constructor(errors: unknown[]) {
        super()
        this._errors = Object.freeze<unknown[]>(errors)
    }

    get errors() {
        return this._errors
    }
}
