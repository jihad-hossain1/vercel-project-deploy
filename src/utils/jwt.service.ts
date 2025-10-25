import logService from "../service/log.service";
import dotenv from "dotenv";
dotenv.config();
import { SignJWT, jwtVerify } from "jose";

class JWTService {
    private secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    private async verifyToken(token: string) {
        try {
            const { payload } = await jwtVerify(token, this.secret, {
                algorithms: ["HS256"],
            });

            return payload;
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    message: `Token verification failed: ${error.message}`,
                    stack: error.stack,
                    error: error,
                    path: "JWTService.verifyToken",
                });
            }
            return null;
        }
    }

    async verify(token: string) {
        return await this.verifyToken(token);
    }
}

export default new JWTService();
