const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')

// Init client
const notion = new Client({
    auth: process.env.NOTION_TOKEN
})

const databaseId = process.env.NOTION_DATABASE_ID

module.exports = async function getDataWithCPF(cpfSelect){
    const { results } = await notion.databases.query({
        database_id: databaseId,
        filter: {
            property: 'CPF',
            rich_text: {
                equals: cpfSelect
            }
        }
    });

    const dataWithCpf = results.map((page) => {
        return {
            id: page.id,
            cpf: page.properties.CPF,
            completeName: page.properties['Nome Completo'],
            passCheck: page.properties['Quais Passos Já Concluiu?'],
            passActual: page.properties['Qual Passo Está?']
        }
      });

      const propertiesCpf = await notion.pages.properties.retrieve({
        page_id: dataWithCpf[0].id,
        property_id: dataWithCpf[0].cpf.id
        });

        const propertiesName = await notion.pages.properties.retrieve({
            page_id: dataWithCpf[0].id,
            property_id: dataWithCpf[0].completeName.id
        });

        const propertiesPassCheck = await notion.pages.properties.retrieve({
            page_id: dataWithCpf[0].id,
            property_id: dataWithCpf[0].passCheck.id
        });

        var passCheck = [];
        for (let index = 0; index < propertiesPassCheck.multi_select.length; index++) {
            passCheck.push(propertiesPassCheck.multi_select[index].name);            
        }

        const propertiesActualPass = await notion.pages.properties.retrieve({
            page_id: dataWithCpf[0].id,
            property_id: dataWithCpf[0].passActual.id
        })

        let passActual = "";
        if (propertiesActualPass.select){
            passActual = propertiesActualPass.select.name;
        } else passActual = "";

        const data = {
            cpf: propertiesCpf.results[0].rich_text.text.content,
            nome: propertiesName.results[0].title.text.content,
            passo_concluiu: passCheck,
            passo_atual: passActual
        }

        return data;
}