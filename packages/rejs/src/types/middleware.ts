import { RequestHandler } from 'express'

import { RejsOptions } from './rejs-options'

export type Middleware = (configuration: RejsOptions) => (RequestHandler<any, any, any, any, Record<string, any>> & {
    prefix?: string
})[]
