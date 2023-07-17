async function paramCheck(params: String): Promise<string[]> {
    if (params == null) return [''];
    let paramArr: Array<string>, paramReturn: Array<string> = [];
    if (params.includes('"')) {
        paramArr = params.split(/(["])/);
        for (const i in paramArr) {
            if (paramArr[i][0] === " " || paramArr[i][paramArr[i].length-1] === " ") {
                paramArr[i] = paramArr[i].trim();
                let item = paramArr[i].split(" ");
                paramArr.splice(Number(i), 1, ...item);
            }
        }
        for (const i in paramArr) {
            if (paramArr[i] === '"') paramArr.splice(Number(i), 1);
        }
        paramArr = popBlank(paramArr);
    } else {
        paramArr = params.split(' ');
    }
    
    for (const i in paramArr) {
        paramReturn.push(paramArr[i]);
    }
    return (paramReturn !== []) ? paramReturn : (paramArr[0] === '') ? [''] : paramArr;
}

function popBlank(array: Array<string>): Array<string> {
    while (array.includes(' ')) {
        array.splice(array.indexOf(' '), 1);
    }
    while (array.includes('')) {
        array.splice(array.indexOf(''), 1);
    }
    return array;
}

export = paramCheck;