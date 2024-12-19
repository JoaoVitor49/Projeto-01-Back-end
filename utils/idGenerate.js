function idGenerate(array){
    if (array.length === 0) {
        return 1;
    } else {
        return array[array.length - 1].id + 1;
    }
}

module.exports = {idGenerate}