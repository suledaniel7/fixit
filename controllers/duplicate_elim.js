//This is a much needed module for moi, to eliminate duplicate values in an array
function duplicateElim(arr){
    arr.forEach(element => {
        var elemPos = arr.indexOf(element) + 1;
        for(elemPos; elemPos < arr.length; elemPos++){
            if(arr[elemPos] === element){
                arr.splice(elemPos, 1);
            }
        }
    });

    return arr;
}

module.exports = duplicateElim;