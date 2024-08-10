const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');
const path = require('path');

const app = express();

// Use static middleware to serve files from the 'uploads' directory
app.use(express.static(path.join(__dirname, 'uploads')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index',{data:''}); // Render the 'index.ejs' view
});

app.post('/extracttextfromimage', upload.single('file'), (req, res) => {
    console.log(req.file.path);
    const config = {
        lang: 'eng',
        oem: 1,
        psm: 3,
    };

    tesseract
        .recognize(req.file.path, config)
        .then((text) => {
            console.log('Result:', text);

            res.render('index',{data:text})
            res.send(`Extracted Text: ${text}`);
        })
        .catch((error) => {
            console.log(error.message);
            res.status(500).send('Error processing image');
        });
});

app.listen(5000, () => {
    console.log('App is listening on port 5000');
});
