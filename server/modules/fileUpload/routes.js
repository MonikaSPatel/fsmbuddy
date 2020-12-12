import express from "express";
var router = express.Router();

import { FileUploadController } from "./controller";

router
  .post("/upload", FileUploadController.fileUpload)
  .post("/remove-file", FileUploadController.removeFile);

module.exports = router;
