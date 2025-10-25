import { Request, Response } from "express";
declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    verify(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    verifyCode(req: Request, res: Response): Promise<void>;
    confirmPassword(req: Request, res: Response): Promise<void>;
    applyForActivation(req: Request, res: Response): Promise<void>;
    userActivate(req: Request, res: Response): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map