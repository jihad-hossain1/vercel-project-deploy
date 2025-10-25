import dotenv from "dotenv";
dotenv.config();

class FileUploadHandler {
  config: any;
  constructor(config: any) {
    this.config = {
      maxFileSize: 5 * 1024 * 1024, // 5MB default
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

  /**
   * Validates the uploaded file
   */
  validateFile(file: any) {
    if (!file) {
      return { isValid: false, error: "No file provided" };
    }

    if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${
          this.config.maxFileSize / (1024 * 1024)
        }MB`,
      };
    }

    if (
      this.config.allowedMimeTypes &&
      !this.config.allowedMimeTypes.includes(file.mimetype)
    ) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed`,
      };
    }

    return { isValid: true };
  }

  /**
   * Uploads a file to the configured endpoint
   */
  async uploadFile(file: any) {
    try {
      if (!file) {
        return {
          success: false,
          error: "No file uploaded",
        };
      }

      // Validate the file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Convert multer file buffer to Blob for FormData
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

      const result = (await response.json()) as any;

      return {
        success: true,
        fileUrl: result?.data?.url,
        fileName: result?.data?.fileName,
        extension: result?.data?.extension,
        type: result?.data?.type,
      };
    } catch (error) {
      console.error("File upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  }

  /**
   * Uploads multiple files
   */
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

// Default instance for common use cases
const defaultFileUploadHandler = new FileUploadHandler({
  uploadEndpoint:
    process.env.FILE_UPLOAD_API_URL + "/api/upload" ||
    "http://localhost:9000/api/upload",
});

export { FileUploadHandler, defaultFileUploadHandler };
