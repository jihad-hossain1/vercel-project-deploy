"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../generated/prisma");
const prismaClientSingleton = () => {
    return new prisma_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
};
let prisma;
if (process.env.NODE_ENV === "production") {
    prisma = prismaClientSingleton();
}
else {
    if (!globalThis.prisma) {
        globalThis.prisma = prismaClientSingleton();
    }
    prisma = globalThis.prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map