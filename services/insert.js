const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')

// Init client
const notion = new Client({
    auth: process.env.NOTION_TOKEN
})

const databaseId = process.env.NOTION_DATABASE_ID

module.exports = async function createData(nomeCompleto, cpf){
    const createdData = await notion.pages.create({
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
    return createData
}