export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}
