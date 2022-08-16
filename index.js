const express = require('express');
//const getBuscar = require('./services/notion');
const getDataWithCPF = require('./services/getDataWithCPF');
const getAll = require('./services/getAll');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static("public"));

app.get("/data", async (req, res) => {
    const nDados = await getAll();
    res.json(nDados);
});

app.get("/dataWithCpf", async (req, res) => {
    const nDados = await getDataWithCPF("12233344455");
    res.json(nDados);
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));


/*
(async () => {
    const nDadosWithCPF = await getDataWithCPF("12233344455");
    console.log(nDadosWithCPF);

    /*
    const nDados = await getAll();
    console.log(nDados);
})();
*/