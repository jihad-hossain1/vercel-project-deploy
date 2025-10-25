import prisma from "../lib/prisma";
import logService from "./log.service";
import utilsService from "../utils/utils.service";
import { userSchema, loginSchema, TUserSchema } from "../helpers/validate";
import { sendMail } from "./mail.service";
import dotenv from "dotenv";
import { Prisma } from "@prisma/client";
dotenv.config();

class AuthService {
    /**
     *
     * @param {email} email: must be valid email
     * @param {jsonData} jsonData: {email,password,mobile,name}
     * @returns {success} success message | error
     */
    async register({ email, jsonData }: { email: string; jsonData: TUserSchema }): Promise<{ success: boolean; error?: any }> {
        const result = userSchema.safeParse(jsonData);

        if (!result.success) {
            return {
                success: false,
                error: result.error.format(),
            };
        }
        try {
            const existingUser = await prisma.$queryRaw`
        SELECT * FROM temp WHERE email = ${email}
      `;

            if (existingUser[0]?.length > 0) {
                throw new Error("User already exists");
            }
            const randomNumber = utilsService.randomNumber();

            await prisma.$queryRaw`
        INSERT INTO temp (email, jsonData, code)
        VALUES (${email}, ${jsonData}, ${randomNumber})
      `;

            await sendMail({
                to: email,
                subject: "Verify [B2C]",
                html: `
        <h1>Welcome to B2C</h1>
        <p>Your verification code is: ${randomNumber}</p>
        `,
            });
            // log register user
            logService.info({
                source: "auth-service",
                message: "User registered",
                context: { email, code: randomNumber },
            });
            return { success: true };
        } catch (error) {
            logService.error({
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

    /**
     *
     * @param {email} email: valid register email
     * @param {code} code: 6 digit code
     * @returns [user]
     */
    async verify({ email, code }: { email: string; code: string }): Promise<{ success: boolean; error?: any }> {
        if (!email || !code) {
            return { success: false, error: "Required Field are missing" };
        }

        try {
            const findTempData = await prisma.$queryRaw`
        SELECT * FROM temp WHERE email = ${email} `;

            if (findTempData[0]?.length === 0) {
                return { success: false, error: "User not found" };
            }

            const tempData = findTempData[0];

            if (tempData.code !== code) {
                return { success: false, error: "Invalid code" };
            }

            const sanitizeData = tempData.jsonData;

            // create user
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
                        password: utilsService.passwordEncrypt(sanitizeData.password),
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

                await tx.$queryRaw`
        DELETE FROM temp WHERE email = ${email}
      `;
            });
            logService.info({
                source: "auth-service",
                message: "User verified and registered",
                context: { email },
            });
            return { success: true };
        } catch (error) {
            logService.error({
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

    /**
     *
     * @param {email} email: valid register email
     * @param {password} password: minimum 6 character password
     * @returns {users}
     */
    async login({ email, password }: { email: string; password: string }): Promise<{
        success: boolean;
        error?: any;
        is_active?: boolean;
        not_active?: boolean;
        data?: TUserSchema;
    }> {
        const safeParse = loginSchema.safeParse({ email, password });

        if (!safeParse?.success) {
            return { success: false, error: safeParse.error.flatten() };
        }

        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;

            if (!user?.[0]) {
                return { success: false, error: "Invalid User" };
            }

            // check user are active or not
            if (!user?.[0]?.isActive) {
                return {
                    success: false,
                    error: "user are not active",
                    not_active: true,
                };
            }

            const matchPassword = utilsService.passwordDecrypt(password, user?.[0]?.password);
            if (!matchPassword) {
                return { success: false, error: "Invalid credential" };
            }

            const getBusinessInfo = await prisma.$queryRaw`
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
        } catch (error) {
            logService.error({
                source: "auth-service",
                message: "Login failed",
                details: `${error instanceof Error ? error.message : "Unknown error"}`,
                context: { email: email },
            });
            throw new Error(`${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    /**
     *
     * @param {email} email: valid register email
     * @returns {success} success message | error
     */
    async forgotPassword({ email }: { email: string }): Promise<{ success: boolean; error?: any }> {
        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;

            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }

            const randomNumber = utilsService.randomNumber();

            // delete old code
            await prisma.$queryRaw`
        DELETE FROM temp WHERE email = ${email}
      `;

            await prisma.temp.create({
                data: {
                    email,
                    jsonData: {
                        email,
                    },
                    code: randomNumber.toString(),
                },
            });

            await sendMail({
                to: email,
                subject: "Verify [B2C]",
                html: `
        <h1>Welcome to B2C</h1>
        <p>Your verification code is: ${randomNumber}</p>
        `,
            });

            return { success: true };
        } catch (error) {
            logService.error({
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

    /**
     *
     * @param {email} email: valid register email
     * @param {code} code: 6 digit code
     * @returns {success} success message | error
     */
    async verifyCode({ email, code }: { email: string; code: string }): Promise<{ success: boolean; error?: any }> {
        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM temp WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }

            if (user?.[0]?.code !== code) {
                return { success: false, error: "Invalid code" };
            }
            // delete code from temp table
            await prisma.$queryRaw`
        DELETE FROM temp WHERE email = ${email}
      `;

            return { success: true };
        } catch (error) {
            logService.error({
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

    /**
     *
     * @param {email} email: valid register email
     * @param {password} password: minimum 6 character password
     * @returns {success} success message | error
     */
    async confirmPassword({ email, password }: { email: string; password: string }): Promise<{ success: boolean; error?: any }> {
        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;

            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }

            // update password
            await prisma.users.update({
                where: {
                    email: email,
                },
                data: {
                    password: utilsService.passwordEncrypt(password),
                },
            });

            return { success: true };
        } catch (error) {
            logService.error({
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

    /**
     *
     * @param {email} email: valid register email
     * @returns {success} success message | error
     */
    async applyForActivation({ email }: { email: string }): Promise<{ success: boolean; error?: any; message?: string }> {
        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (user?.[0]?.isActive) {
                return { success: true, message: "User already active" };
            }

            // check temp data exist
            const temp = await prisma.$queryRaw`
        SELECT * FROM temp WHERE email = ${email} AND type = 'user_activation'
      `;

            if (temp?.[0]) {
                return { success: true, message: "User already apply for activation" };
            }

            // temp table
            await prisma.temp.create({
                data: {
                    email,
                    jsonData: {
                        email,
                    },
                    code: "randomNumber",
                    type: "user_activation",
                },
            });

            // send mail on admin
            await sendMail({
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
        } catch (error) {
            logService.error({
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

    /**
     *
     * @param {email} email: valid register email
     * @returns {success} success message | error
     */
    async userActivate({ email }: { email: string }): Promise<{ success: boolean; error?: any; message?: string }> {
        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;

            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (user?.[0]?.isActive) {
                return { success: false, error: "User already active" };
            }
            // update user
            await prisma.users.update({
                where: {
                    email: email,
                },
                data: {
                    isActive: true,
                },
            });

            // delete temp data
            await prisma.$queryRaw`
        DELETE FROM temp WHERE email = ${email} AND type = 'user_activation'
      `;

            return { success: true };
        } catch (error) {
            logService.error({
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
    /**
     *
     * @param {email} email: valid register email
     * @returns {success} success message | error
     */
    async deactivateUser({ email }: { email: string }): Promise<{ success: boolean; error?: any; message?: string }> {
        try {
            const user = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;
            if (!user?.[0]) {
                return { success: false, error: "User not found" };
            }
            if (!user?.[0]?.isActive) {
                return { success: false, error: "User not active" };
            }
            // update user
            await prisma.users.update({
                where: {
                    email: email,
                },
                data: {
                    isActive: false,
                },
            });
            return { success: true };
        } catch (error) {
            logService.error({
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

export default new AuthService();
