const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')

// Init client
const notion = new Client({
    auth: process.env.NOTION_TOKEN
});

const databaseId = process.env.NOTION_DATABASE_ID

module.exports = async function getAll() {
    const { results } = await notion.databases.query({
        database_id: databaseId
    });

    const pagesResults = results.map((page) => {
        return {
          id: page.id,
          cpf: page.properties.CPF,
          completeName: page.properties['Nome Completo'],
          passCheck: page.properties['Quais Passos Já Concluiu?'],
          passActual: page.properties['Qual Passo Está?']
        }
    });

    // Buscar CPF
    const listCpf = [];
    for (const pagesCPF of pagesResults) {
        listCpf.push(await notion.pages.properties.retrieve({
            page_id: pagesCPF.id,
            property_id: pagesCPF.cpf.id
        }))
    }

    var resultsCpf = [];
    for (const cpf of listCpf) {
        resultsCpf.push(cpf.results[0].rich_text.text.content);
    }

    // Buscar o dado de Nome
    const listNames = [];
    for (const pagesNames of pagesResults) {
        listNames.push(await notion.pages.properties.retrieve({
            page_id: pagesNames.id,
            property_id: pagesNames.completeName.id
        }))        
    }

    var resultsNames = [];
    for (const name of listNames) {
        resultsNames.push(name.results[0].title.text.content);
    }

    // Buscar o dado de Qual passo Concluiu
    const listPassCheck = [];
    for (const pagesPassCheck of pagesResults) {
        listPassCheck.push(await notion.pages.properties.retrieve({
            page_id: pagesPassCheck.id,
            property_id: pagesPassCheck.passCheck.id
        }))        
    }

    var resultsPassChecks = [];
    for (const passCheck of listPassCheck) {
        var passCheckSelect = [];
        for (let index = 0; index < passCheck.multi_select.length; index++) {
            passCheckSelect.push(passCheck.multi_select[index].name);            
        }
        resultsPassChecks.push(passCheckSelect);
    }

    // Buscar qual passo está
    const listPassActual = [];
    for (const pagesPassActual of pagesResults) {
        listPassActual.push(await notion.pages.properties.retrieve({
            page_id: pagesPassActual.id,
            property_id: pagesPassActual.passActual.id
        }))        
    }
    
    var resultsPassActual = [];
    for (const passActual of listPassActual) {
        if (passActual.select){
            resultsPassActual.push(passActual.select.name);
        } else resultsPassActual.push("");
    }

    // Consolidar num array
    const completeList = [];
    for (let index = 0; index < resultsCpf.length; index++) {
        var passCheckSelect = [];
        for (const p of resultsPassChecks[index]) {
            if(p){
                const split = p.split(",");
                for (const s of split) {
                    passCheckSelect.push({
                        nome_passo: s + " "
                    });
                }
            }
        }

        completeList.push({
            chave_busca: resultsCpf[index] + " - " + resultsNames[index],
            numero_documento: resultsCpf[index],
            nome: resultsNames[index],

            passos_concluidos: passCheckSelect,
            passo_atual: resultsPassActual[index]

        });
    }

    return completeList;
}