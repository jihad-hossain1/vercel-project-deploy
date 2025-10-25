import bcrypt from "bcrypt";
import LogService from "../service/log.service";

class UtilsService {
    /**
     * Generates a random string of specified length
     * @param {number} length - The desired length of the random string
     * @returns {string} A random string
     */
    randomString(length: number): string {
        return Math.random()
            .toString(36)
            .substring(2, length + 2);
    }

    /**
     * Generates a random number of specified length
     * @param {number} length - The number of digits in the random number
     * @returns {number} A random number
     */
    randomNumber(length = 6): number {
        return Math.floor(Math.random() * 10 ** length);
    }

    /**
     * Parses a JSON string into an object of type T
     * @template T - The type to parse the JSON into
     * @param {string} jsonString - The JSON string to parse
     * @returns {T | null} The parsed object or null if parsing fails
     */
    jsonToObject<T>(jsonString: string): T | null {
        try {
            return JSON.parse(jsonString) as T;
        } catch (error) {
            if (error instanceof Error) {
                LogService.error({
                    source: "utils-service",
                    message: "Failed to parse JSON string",
                    details: error.message,
                    context: { jsonString },
                });
            } else {
                LogService.error({
                    source: "utils-service",
                    message: "Failed to parse JSON string with unknown error",
                    context: { jsonString },
                });
            }
            return null;
        }
    }

    /**
     * Converts an object to a JSON string
     * @param {unknown} obj - The object to convert to JSON
     * @returns {string | null} The JSON string or null if stringification fails
     */
    objectToJson(obj: unknown): string | null {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            if (error instanceof Error) {
                LogService.error({
                    source: "utils-service",
                    message: "Failed to stringify object",
                    details: error.message,
                    context: { object: obj },
                });
            } else {
                LogService.error({
                    source: "utils-service",
                    message: "Failed to stringify object with unknown error",
                    context: { object: obj },
                });
            }
            return null;
        }
    }

    /**
     * Encrypts a password using bcrypt
     * @param {string} password - The password to encrypt
     * @returns {string} The encrypted password hash
     */
    passwordEncrypt(password: string): string {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    /**
     * Compare a plain text password with a hashed password
     * @param {string} password - The plain text password to check
     * @param {string} hash - The hashed password to compare against
     * @returns {boolean} True if passwords match, false otherwise
     */
    passwordDecrypt(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }
}

export default new UtilsService();
