"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const log_service_1 = __importDefault(require("./log.service"));
const utils_service_1 = __importDefault(require("../utils/utils.service"));
const validate_1 = require("../helpers/validate");
const mail_service_1 = require("./mail.service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthService {
    async register({ email, jsonData }) {
        const result = validate_1.userSchema.safeParse(jsonData);
        if (!result.success) {
            return {
                success: false,
                error: result.error.format(),
            };
        }
        try {
            const existingUser = await prisma_1.default.$queryRaw `
        SELECT * FROM temp WHERE email = ${email}
      `;
            if (existingUser[0]?.length > 0) {
                throw new Error("User already exists");
            }
            const randomNumber = utils_service_1.default.randomNumber();
            await prisma_1.default.$queryRaw `
        INSERT INTO temp (email, jsonData, code)
        VALUES (${email}, ${jsonData}, ${randomNumber})
      `;
            await (0, mail_service_1.sendMail)({
                to: email,
                subject: "Verify [B2C]",
                html: `
        <h1>Welcome to B2C</h1>
        <p>Your verification code is: ${randomNumber}</p>
        `,
            });
            log_service_1.default.info({
                source: "auth-service",
                message: "User registered",
                context: { email, code: randomNumber },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "User registration failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async verify({ email, code }) {
        if (!email || !code) {
            return { success: false, error: "Required Field are missing" };
        }
        try {
            const findTempData = await prisma_1.default.$queryRaw `
        SELECT * FROM temp WHERE email = ${email} `;
            if (findTempData[0]?.length === 0) {
                return { success: false, error: "User not found" };
            }
            const tempData = findTempData[0];
            if (tempData.code !== code) {
                return { success: false, error: "Invalid code" };
            }
            const sanitizeData = tempData.jsonData;
            await prisma_1.default.$transaction(async (tx) => {
                const createBusiness = await tx.business.create({
                    data: {
                        email: sanitizeData.email,
                        mobile: sanitizeData.mobile,
                    },
                });
                const createUser = await tx.users.create({
                    data: {
                        firstName: sanitizeData.firstName,
                        lastName: sanitizeData.lastName,
                        email: sanitizeData.email,
                        password: utils_service_1.default.passwordEncrypt(sanitizeData.password),
                        mobile: sanitizeData.mobile,
                        username: sanitizeData.email.split("@")[0],
                        businessId: createBusiness.id,
                    },
                });
                await tx.user_profile.create({
                    data: {
                        userId: createUser.id,
                        businessId: createBusiness.id,
                    },
                });
                await tx.business_stats.create({
                    data: { businessId: createBusiness.id },
                });
                await tx.$queryRaw `
        DELETE FROM temp WHERE email = ${email}
      `;
            });
            log_service_1.default.info({
                source: "auth-service",
                message: "User verified and registered",
                context: { email },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "User verification failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async login({ email, password }) {
        const safeParse = validate_1.loginSchema.safeParse({ email, password });
        if (!safeParse?.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "Invalid User" };
            }
            if (!user?.[0]?.isActive) {
                return {
                    success: false,
                    error: "user are not active",
                    not_active: true,
                };
            }
            const matchPassword = utils_service_1.default.passwordDecrypt(password, user?.[0]?.password);
            if (!matchPassword) {
                return { success: false, error: "Invalid credential" };
            }
            const getBusinessInfo = await prisma_1.default.$queryRaw `
        SELECT * FROM business WHERE id = ${user?.[0]?.businessId}
      `;
            return {
                success: true,
                data: {
                    ...user?.[0],
                    password: "",
                    isStockManaged: getBusinessInfo?.[0]?.isStockManaged,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Login failed",
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
                context: { email: email },
            });
            throw new Error(`${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async forgotPassword({ email }) {
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            const randomNumber = utils_service_1.default.randomNumber();
            await prisma_1.default.$queryRaw `
        DELETE FROM temp WHERE email = ${email}
      `;
            await prisma_1.default.temp.create({
                data: {
                    email,
                    jsonData: {
                        email,
                    },
                    code: randomNumber.toString(),
                },
            });
            await (0, mail_service_1.sendMail)({
                to: email,
                subject: "Verify [B2C]",
                html: `
        <h1>Welcome to B2C</h1>
        <p>Your verification code is: ${randomNumber}</p>
        `,
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Forgot password failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async verifyCode({ email, code }) {
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM temp WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (user?.[0]?.code !== code) {
                return { success: false, error: "Invalid code" };
            }
            await prisma_1.default.$queryRaw `
        DELETE FROM temp WHERE email = ${email}
      `;
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Verify code failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async confirmPassword({ email, password }) {
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            await prisma_1.default.users.update({
                where: {
                    email: email,
                },
                data: {
                    password: utils_service_1.default.passwordEncrypt(password),
                },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Confirm password failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async applyForActivation({ email }) {
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (user?.[0]?.isActive) {
                return { success: true, message: "User already active" };
            }
            const temp = await prisma_1.default.$queryRaw `
        SELECT * FROM temp WHERE email = ${email} AND type = 'user_activation'
      `;
            if (temp?.[0]) {
                return { success: true, message: "User already apply for activation" };
            }
            await prisma_1.default.temp.create({
                data: {
                    email,
                    jsonData: {
                        email,
                    },
                    code: "randomNumber",
                    type: "user_activation",
                },
            });
            await (0, mail_service_1.sendMail)({
                to: "jihadkhan934@gmail.com",
                subject: `[Apply for activation]-${email}`,
                html: `
        <h1>Apply for activation</h1>
        <p>User ${email} apply for activation</p>
        <p>Please activate user by clicking on the link below</p>
        <a href="${process.env.BASE_URL}/auth/user-activate/${email}">Activate</a>
        `,
            });
            return { success: true, message: "User apply for activation" };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Apply for activation failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async userActivate({ email }) {
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (user?.[0]?.isActive) {
                return { success: false, error: "User already active" };
            }
            await prisma_1.default.users.update({
                where: {
                    email: email,
                },
                data: {
                    isActive: true,
                },
            });
            await prisma_1.default.$queryRaw `
        DELETE FROM temp WHERE email = ${email} AND type = 'user_activation'
      `;
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Activate user failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async deactivateUser({ email }) {
        try {
            const user = await prisma_1.default.$queryRaw `
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (!user?.[0]?.isActive) {
                return { success: false, error: "User not active" };
            }
            await prisma_1.default.users.update({
                where: {
                    email: email,
                },
                data: {
                    isActive: false,
                },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "auth-service",
                message: "Deactivate user failed",
                context: { email },
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map