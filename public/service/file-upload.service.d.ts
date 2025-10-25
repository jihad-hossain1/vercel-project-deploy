declare class FileUploadHandler {
    config: any;
    constructor(config: any);
    validateFile(file: any): {
        isValid: boolean;
        error: string;
    } | {
        isValid: boolean;
        error?: undefined;
    };
    uploadFile(file: any): Promise<{
        success: boolean;
        error: string;
        fileUrl?: undefined;
        fileName?: undefined;
        extension?: undefined;
        type?: undefined;
    } | {
        success: boolean;
        fileUrl: any;
        fileName: any;
        extension: any;
        type: any;
        error?: undefined;
    }>;
    uploadMultipleFiles(req: any): Promise<any[]>;
}
declare const defaultFileUploadHandler: FileUploadHandler;
export { FileUploadHandler, defaultFileUploadHandler };
//# sourceMappingURL=file-upload.service.d.ts.map