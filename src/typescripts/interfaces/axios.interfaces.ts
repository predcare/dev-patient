export enum HttpStatusCode {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

export type TStatusCodes = `${Extract<HttpStatusCode, number>}` extends `${infer N extends number}`
  ? N
  : never;
export interface IBaseApiRoot {
  message: string;
  status: TStatusCodes;
  type: string;
  token: string;
  data: unknown;
  statusCode: number;
}
