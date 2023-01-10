const path = require("path");

const fileExtLimiter = (allowedExtArray) => {
  return (req, res, next) => {
    let { files } = req.files;

    console.log(files);

    let filename = files.name.replace(" ", "_");
    let ext = path.extname(filename);

    const allowed = allowedExtArray.includes(ext);

    if (!allowed) {
      const message =
        `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(
          ",",
          ", "
        );

      return res.status(422).json({ status: "error", message });
    }

    next();
  };
};

module.exports = fileExtLimiter;
