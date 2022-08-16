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
          nomeCompleto: page.properties['Nome Completo'],
          qualPassoConcluiu: page.properties['Quais Passos Já Concluiu?'],
          qualPassoEsta: page.properties['Qual Passo Está?']
        }
    });

    // Buscar CPF
    const listaDadosCPF = [];
    for (const pagesCPF of pagesResults) {
        listaDadosCPF.push(await notion.pages.properties.retrieve({
            page_id: pagesCPF.id,
            property_id: pagesCPF.cpf.id
        }))
    }

    var resultadosEncontradosCPF = [];
    for (const dadoCPF of listaDadosCPF) {
        resultadosEncontradosCPF.push(dadoCPF.results[0].rich_text.text.content);
    }

    // Buscar o dado de Nome
    const listaDadosNomes = [];
    for (const pagesNomes of pagesResults) {
        listaDadosNomes.push(await notion.pages.properties.retrieve({
            page_id: pagesNomes.id,
            property_id: pagesNomes.nomeCompleto.id
        }))        
    }

    var resultadosEncontradosNome = [];
    for (const dadosNome of listaDadosNomes) {
        resultadosEncontradosNome.push(dadosNome.results[0].title.text.content);
    }

    // Buscar o dado de Qual passo Concluiu
    const listaDadosQualPassoConcluiu = [];
    for (const pagesQualPassoConcluiu of pagesResults) {
        listaDadosQualPassoConcluiu.push(await notion.pages.properties.retrieve({
            page_id: pagesQualPassoConcluiu.id,
            property_id: pagesQualPassoConcluiu.qualPassoConcluiu.id
        }))        
    }

    var resultadosEncontradosQualPassoConcluiu = [];
    for (const dadosQualPassoConcluiu of listaDadosQualPassoConcluiu) {
        var passosConcluidos = [];
        for (let index = 0; index < dadosQualPassoConcluiu.multi_select.length; index++) {
            passosConcluidos.push(dadosQualPassoConcluiu.multi_select[index].name);            
        }
        resultadosEncontradosQualPassoConcluiu.push(passosConcluidos);
    }

    // Buscar qual passo está
    const listaDadosQualPassoEsta = [];
    for (const pagesQualPassoEsta of pagesResults) {
        listaDadosQualPassoEsta.push(await notion.pages.properties.retrieve({
            page_id: pagesQualPassoEsta.id,
            property_id: pagesQualPassoEsta.qualPassoEsta.id
        }))        
    }
    
    var resultadosEncontradosQualPassoEsta = [];
    for (const dadosQualPassoEsta of listaDadosQualPassoEsta) {
        if (dadosQualPassoEsta.select){
            resultadosEncontradosQualPassoEsta.push(dadosQualPassoEsta.select.name);
        } else resultadosEncontradosQualPassoEsta.push("");
    }

    // Consolidar num array
    const listaCompleta = [];
    for (let index = 0; index < resultadosEncontradosCPF.length; index++) {
        var passosConcluido = [];
        for (const p of resultadosEncontradosQualPassoConcluiu[index]) {
            if(p){
                const split = p.split(",");
                for (const s of split) {
                    passosConcluido.push({
                        nome_passo: s + " "
                    });
                }
            }
        }

        listaCompleta.push({
            chave_busca: resultadosEncontradosCPF[index] + " - " + resultadosEncontradosNome[index],
            numero_documento: resultadosEncontradosCPF[index],
            nome: resultadosEncontradosNome[index],

            passos_concluidos: passosConcluido,
            passo_atual: resultadosEncontradosQualPassoEsta[index]

        });
    }

    return listaCompleta;
}