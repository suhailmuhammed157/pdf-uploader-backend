const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const filesPayloadExists = require("./middleware/filesPayloadExists");
const fileExtLimiter = require("./middleware/fileExtLimiter");
const fileSizeLimiter = require("./middleware/fileSizeLimiter");

const PORT = process.env.PORT || 3500;

const app = express();
app.use(cors());

app.post(
  "/upload",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".pdf"]),
  fileSizeLimiter,
  (req, res) => {
    const { files } = req.files;
    const fileName = Date.now() + files.name;
    const filepath = path.join(__dirname, "./files", fileName);

    var data = fs.readFileSync("data.json"); //read data from file data.json
    var myObject = JSON.parse(data);
    let id;
    if (!myObject.at(-1)) {
      id = 1;
    } else {
      id = Number(myObject.at(-1).id) + 1; //increment id if already data is present
    }
    const postData = {
      id: id,
      path: `./files/${fileName}`,
    };
    myObject.push(postData); //add the new file
    var newData = JSON.stringify(myObject);
    fs.writeFileSync("data.json", newData, (err) => {
      //write newly added file to data.json
      // error checking
      if (err) throw err;
      console.log("data added succesfully");
    });
    files.mv(filepath, (err) => {
      if (err) return res.status(500).json({ status: "error", message: err });
    });

    return res.json({
      status: "success",
      message: "Files added succesfully",
    });
  }
);

app.get("/:id", (req, res) => {
  const { id } = req.params;
  var data = fs.readFileSync("data.json"); //read data from file data.json
  var myObject = JSON.parse(data);
  const path = myObject.find((item) => item.id === +id).path;
  if (!path)
    res.json({
      status: "success",
      message: "no data found",
    });
  var file = fs.readFileSync(path);
  res.contentType("application/pdf");
  res.send(file);
});

app.get("/", (req, res) => {
  var data = fs.readFileSync("data.json"); //read data from file data.json
  var myObject = JSON.parse(data);

  return res.json({
    status: "success",
    result: myObject,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
