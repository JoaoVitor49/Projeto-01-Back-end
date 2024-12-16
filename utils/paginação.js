function paginate(array, limit, page){
    page = parseInt(page)
    limit = parseInt(limit)
    if (![5, 10, 30].includes(limit)) {
        throw new Error("O parâmetro 'limit' deve ser 5, 10 ou 30.")
    }
    if (page < 1) {
        throw new Error("O parâmetro 'page' deve ser maior ou igual a 1.")
    }
    const start = (page-1)*limit 
    const end = start+limit
    return array.slice(start,end)
}

module.exports = {paginate}