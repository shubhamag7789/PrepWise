/**
 * Multer upload middleware for resume PDFs (memory storage).
 */
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter,
});

/** Single PDF field name: "resume" */
const uploadResumePdf = upload.single('resume');

/** Wrap multer to forward errors to Express error handler */
const handleUpload = (req, res, next) => {
  uploadResumePdf(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('File too large. Maximum size is 5 MB.'));
    }
    return next(err instanceof ApiError ? err : ApiError.badRequest(err.message));
  });
};

module.exports = { handleUpload, MAX_FILE_SIZE };
