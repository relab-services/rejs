import { z } from 'zod'

import { Method, MethodWithoutBody } from './method'

export type InferParam<T extends z.ZodObject<any> | z.ZodType | undefined> = T extends z.ZodObject<any> ? z.infer<T> : T extends z.ZodType ? z.infer<T> : never

export type InferResult<T extends z.ZodObject<any> | z.ZodType | undefined> = T extends z.ZodObject<any>
    ? z.infer<T> | Promise<z.infer<T>>
    : T extends z.ZodType
      ? z.infer<T> | Promise<z.infer<T>>
      : void | Promise<void>

export type HandlerParams<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }

export type EnsureBodyProp<M extends Method, T> = M extends MethodWithoutBody ? Omit<T, 'body'> : T
