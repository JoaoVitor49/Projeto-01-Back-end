const fs = require('fs').promises

async function read(filePath){
    try {
         const data = await fs.readFile(filePath, 'utf8')
    if(data){
        return JSON.parse(data);
    }else return []
    } catch (error) {
        console.error("Erro ao analisar JSON:", error);
        return res.status(400).json({ message: "Erro ao processar dados JSON." });
    }
   
    
}

async function write(filePath, data){
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

module.exports = {read, write}