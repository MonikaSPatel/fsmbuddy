const multer = require("multer");
import moment from "moment";
import message from "./message";
const fs = require("fs");
export const FileUploadController = {
  fileUpload(req, res, next) {
    const fullUrl = req.protocol + "://" + req.get("host");
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/");
      },
      filename: function (req, file, cb) {
        let nameSplitArr = file.originalname.split(".");
        let fileExtension = nameSplitArr[nameSplitArr.length - 1];
        file.name = `${moment().unix()}.${fileExtension}`;
        cb(null, file.name);
      },
    });
    const upload = multer({ storage: storage }).array("files", 3);
    upload(req, res, function (err) {
      if (err) {
        //An error occurred when uploading
        res.badRequest({}, message.FAILED);
      } else {
        let files = [];
        _.each(req.files, function (file) {
          files.push(`/uploads/${file.name}`);
        });
        res.ok(files, message.OK);
      }
    });
  },
  removeFile(req, res) {
    let params = req.body;
    const fullUrl = req.protocol + "://" + req.get("host");
    try {
      if (!params || !params.removeFilePath) {
        return res.badRequest(err, message.BAD_REQUEST);
      }
      if (params.removeFilePath.indexOf("http") > -1) {
        params.removeFilePath = params.removeFilePath.replace(fullUrl, "");
      }
      fs.unlinkSync(`${rootPath}/${params.removeFilePath}`);
      res.ok({}, message.REMOVED_SUCCESS);
    } catch (error) {
      res.serverError({}, message.FAILED);
    }
  },
};
