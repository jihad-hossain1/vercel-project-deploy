declare class JWTService {
    private secret;
    private verifyToken;
    verify(token: string): Promise<import("jose").JWTPayload>;
}
declare const _default: JWTService;
export default _default;
//# sourceMappingURL=jwt.service.d.ts.map