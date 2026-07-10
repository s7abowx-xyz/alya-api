import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      apiUser?: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}
