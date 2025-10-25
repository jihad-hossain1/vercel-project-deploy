declare class UtilsService {
    randomString(length: number): string;
    randomNumber(length?: number): number;
    jsonToObject<T>(jsonString: string): T | null;
    objectToJson(obj: unknown): string | null;
    passwordEncrypt(password: string): string;
    passwordDecrypt(password: string, hash: string): boolean;
}
declare const _default: UtilsService;
export default _default;
//# sourceMappingURL=utils.service.d.ts.map