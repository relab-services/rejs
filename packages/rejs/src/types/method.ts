export type MethodWithoutBody = 'GET' | 'HEAD' | 'OPTIONS'
export type MethodWithBody = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type Method = MethodWithoutBody | MethodWithBody

export const doesntHaveBody = (method: Method): method is MethodWithoutBody => method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
export const hasBody = (method: Method): method is MethodWithBody => method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
