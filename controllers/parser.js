function parse(full_text, parsee){
    //this is a function to parse a string based on separators
    var index = full_text.indexOf(parsee);
    let arr = new Array;

    var substr = full_text.slice(0, index);
    arr.push(substr);
    
    var last = index+1;
    var rest = full_text.slice(last);

    while(true){
        index = rest.indexOf(parsee);
        if(index === -1){
            arr.push(rest);
            break;
        }
        substr = rest.slice(0, index);
        arr.push(substr);
        last = index+1;
        rest = rest.slice(last);
        if(!rest[0]){
            break;
        }
    }
    let wsp = /^\s*$/;
    arr.forEach((elem)=>{
        if(wsp.test(elem)){
            let index = arr.indexOf(elem);
            arr.splice(index, 1);
        }
    });

    return arr;
}

module.exports = parse;