const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')

// Init client
const notion = new Client({
    auth: process.env.NOTION_TOKEN
});

const databaseId = process.env.NOTION_DATABASE_ID
const page_id = process.env.NOTION_PAGE_ID

const nomeCompleto = "Paulo Benedito Lucas Duarte";
const cpf = "92470655773";

const cpfBuscado = "00999888777";

const getTest = async() => {
    const testes = {
        id: 1,
        nome: "Teste"
    };

    return testes;
}

module.exports = async function buscarDadoPeloCpf(){

    const { results } = await notion.databases.query({
        database_id: databaseId,
        filter: {
            property: 'CPF',
            rich_text: {
                equals: cpfBuscado
            }
        }
    });
    
    const pageId = results.map((page) => {
        return {
          id: page.id,
          cpf: page.properties.CPF,
          nomeCompleto: page.properties['Nome Completo'],
        }
    });

    const responsePageId = await notion.pages.properties.retrieve({
        page_id: pageId[0].id,
        property_id: pageId[0].cpf.id
    });

    const responsePageName = await notion.pages.properties.retrieve({
        page_id: pageId[0].id,
        property_id: pageId[0].nomeCompleto.id
    });

    const dado = [];

    dado.push({
        cpf: responsePageId.results[0].rich_text.text.content,
        nome: responsePageName.results[0].title.text.content
    });

    //console.log(dado);

    return dado;
};

//buscarDadoPeloCpf();

const listarDadoSimples = async () => {

    const { results } = await notion.databases.query({
        database_id: databaseId
    });

    const pagesResults = results.map((page) => {
        return {
          id: page.id,
          id_CPF: page.properties.CPF.id,
          id_nome: page.properties['Nome Completo'].id
        }
    });

    // Buscar o dado CPF
    var responsePageIdCpf = [];

    for (const pageIdCpf of pagesResults) {
        responsePageIdCpf.push(await notion.pages.properties.retrieve({
            page_id: pageIdCpf.id,
            property_id: pageIdCpf.id_CPF
        }));
    }

    var resultSearchCpf = [];
    for (const dataCpf of responsePageIdCpf) {
        resultSearchCpf.push(dataCpf.results[0].rich_text.text.content)
    }

    // Buscar o dado de Nome
    var responsePageIdName = [];

    for (const pageIdName of pagesResults) {
        responsePageIdName.push(await notion.pages.properties.retrieve({
            page_id: pageIdName.id,
            property_id: pageIdName.id_nome
        }));
    }

    var resultSearchName = [];
    for (const dataName of responsePageIdName) {
        resultSearchName.push(dataName.results[0].title.text.content)
    }

    // Consolidar num array apenas
    var resultComplete = [];
    for (let index = 0; index < resultSearchCpf.length; index++) {
        var data = [index, resultSearchCpf[index], resultSearchName[index]]
        resultComplete.push(data);     
    }

    console.log(resultComplete);
};

const listarDado = async () => {

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

    console.log(listaCompleta);
};


const inserirDado = async () => {
    const response = await notion.pages.create({
      "parent": {
          "type": "database_id",
          "database_id": databaseId
      },
      "properties": {
          "Nome completo": {
              "title": [
                  {
                      "text": {
                          "content": nomeCompleto
                      }
                  }
              ]
          },
          "CPF": {
              "rich_text": [
                  {
                      "text": {
                          "content": cpf
                      }
                  }
              ]
          }
      }
    });
};



//listarDado();