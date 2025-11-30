import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  console.error(" Error Log:", err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "File size is too big. Please upload files under 10MB.",
        issues: ["File size exceeded 10MB limit"]
      });
    }
    return res.status(400).json({
      error: "Upload Error",
      message: err.message,
      issues: [err.message]
    });
  }

  if (err.message && err.message.includes("Unsupported file type")) {
    return res.status(400).json({
      error: "Invalid Format",
      message: err.message,
      issues: [err.message]
    });
  }

  
  if (err.message && (err.message.includes("JSON") || err.message.includes("AI"))) {
    return res.status(422).json({
      error: "Processing Failed",
      message: "The AI could not read this document clearly.",
      issues: ["AI failed to extract structured data. Please ensure the file is clear."]
    });
  }

  res.status(500).json({
    error: "Server Error",
    message: "Something went wrong internally.",
    issues: [process.env.NODE_ENV === "development" ? err.message : "Internal Server Error"]
  });
};