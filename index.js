const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const requestIP = require('request-ip')

// const { compileazaScss } = require('./scss-compiler');

// // Use compileazaScss function
// compileazaScss('Resources/custom.scss', 'general.css');

let errorData = {};
fs.readFile('erori.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Failed to read error data", err);
        return;
    }
    errorData = JSON.parse(data);
});

global.obGlobal = {
    obErori: null,
};

// Initializam erorile din JSON
function initErori() {
    const filePath = path.join(__dirname, 'erori.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Failed to read error data", err);
            return;
        }
        const jsonData = JSON.parse(data);
        global.obGlobal.obErori = jsonData.info_erori.map(eroare => {
            eroare.imagine = path.join(__dirname, jsonData.cale_baza, eroare.imagine);
            return eroare;
        });
        console.log('Error data initialized:', global.obGlobal.obErori);
    });
}
initErori();

function afisareEroare(res, identificator, titlu, text, imagine) {
    const eroare = global.obGlobal.obErori.find(e => e.identificator === identificator) || {};
    res.render('fragments/eroare', {
        titlu: titlu || eroare.titlu || 'Error',
        text: text || eroare.text || 'An unexpected error occurred.',
        imagine: imagine || eroare.imagine || '/path/to/default/error/image.png'
    });
}
//creare fisiere
const folderNames = ['temp'];
folderNames.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
});
// Ejs
app.set('view engine', 'ejs');

// Viewuri
app.set('views', path.join(__dirname, 'views'));

// Fisiere statice
// app.use(express.static(path.join(__dirname + '/Resources')));
app.use(express.static('Resources'));
// app.use('/Resources', express.static('/Resources'))

// Rute
app.get('/welcome', (req, res) => {
    res.render('pages/index');
});
app.get('/news', (req, res) => {
    res.render('pages/news');
});
app.get('/entertainment', (req, res) => {
    res.render('pages/entertainment');
});
app.get('/shop', (req, res) => {
    res.render('pages/shop');
});
app.get('/*.ejs', (req, res) => {
    res.status(400).send('Bad Request');
});

app.get('/Resources/*', (req, res, next) => {
    if (req.path.endsWith('/')) {
        afisareEroare(res, 403, 'Forbidden', 'Access to this resource on the server is denied!');
    } else {
        next(); // Tot cautam daca nu avem file access
    }
});

app.use('/Resources', express.static(path.join(__dirname, 'Resources'), {
    setHeaders: function (res, path) {
      console.log(path); // This will log the path of each static file request
    }
}));

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'Resources', 'ico', 'favicon.ico'));
});

app.get(['/', '/index', '/home'], (req, res) => {
    const ipAddress = requestIP.getClientIp(req);
    console.log(ipAddress);
    res.render('pages/index');
});

// Rendering generic de pagina
app.get('/*', (req, res) => {
    res.render(`pages/${req.params[0]}`, function(err, html) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                res.render('fragments/eroare', { 
                    title: "404 Not Found", 
                    message: "The page you are looking for might have been removed." 
                });
            } else {
                res.status(500).send('Server Error');
            }
        } else {
            res.send(html);
        }
    });
});

// Avem port 8080
app.listen(8080, () => console.log('Server running on http://localhost:8080'));

