import { Request, Response, NextFunction } from 'express';
declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
declare const globalErrorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export { notFoundHandler, globalErrorHandler };
//# sourceMappingURL=errorhandler.d.ts.map