"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFileUploadHandler = exports.FileUploadHandler = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class FileUploadHandler {
    constructor(config) {
        this.config = {
            maxFileSize: 5 * 1024 * 1024,
            allowedMimeTypes: [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/jpeg",
                "image/png",
                "image/jpg",
                "video/mp4",
                "video/mpeg",
                "audio/mpeg",
                "audio/mp3",
            ],
            ...config,
        };
    }
    validateFile(file) {
        if (!file) {
            return { isValid: false, error: "No file provided" };
        }
        if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
            return {
                isValid: false,
                error: `File size exceeds limit of ${this.config.maxFileSize / (1024 * 1024)}MB`,
            };
        }
        if (this.config.allowedMimeTypes &&
            !this.config.allowedMimeTypes.includes(file.mimetype)) {
            return {
                isValid: false,
                error: `File type ${file.mimetype} is not allowed`,
            };
        }
        return { isValid: true };
    }
    async uploadFile(file) {
        try {
            if (!file) {
                return {
                    success: false,
                    error: "No file uploaded",
                };
            }
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error,
                };
            }
            const fileBlob = new Blob([file.buffer], { type: file.mimetype });
            const formData = new FormData();
            formData.append("file", fileBlob, file.originalname);
            const response = await fetch(this.config.uploadEndpoint, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }
            const result = (await response.json());
            return {
                success: true,
                fileUrl: result?.data?.url,
                fileName: result?.data?.fileName,
                extension: result?.data?.extension,
                type: result?.data?.type,
            };
        }
        catch (error) {
            console.error("File upload error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown upload error",
            };
        }
    }
    async uploadMultipleFiles(req) {
        const files = req.files;
        if (!files || files.length === 0) {
            return [
                {
                    success: false,
                    error: "No files uploaded",
                },
            ];
        }
        const uploadPromises = files.map(async (file) => {
            return this.uploadFile(file);
        });
        return Promise.all(uploadPromises);
    }
}
exports.FileUploadHandler = FileUploadHandler;
const defaultFileUploadHandler = new FileUploadHandler({
    uploadEndpoint: process.env.FILE_UPLOAD_API_URL + "/api/upload" ||
        "http://localhost:9000/api/upload",
});
exports.defaultFileUploadHandler = defaultFileUploadHandler;
//# sourceMappingURL=file-upload.service.js.map