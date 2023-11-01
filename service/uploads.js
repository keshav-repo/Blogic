const { config } = require('dotenv');
const multer = require('multer'),
      _ = require('underscore')
      config = require('./config'),
      L = null;

function uploads(opts){
    L = opts.L || require('pino');
    let self = this;
    self.config = config(opts);
    self.uploadDir = _.get(config, 'uploadDirectory', '/tmp');
    self.storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, self.uploadDir); 
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
    });
    return multer({ storage: storage });
}

// const upload = multer({ storage: storage });

// imageProcessor.saveFile = function(){
//     upload.single
// }

module.exports = uploads;

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); 
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, file.fieldname + '-' + uniqueSuffix);
//     },
// });

