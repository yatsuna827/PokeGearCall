class LCG{
    constructor(initialSeed){
        this.seed = initialSeed;
        this.advance = () => { this.seed = mult32(this.seed, 0x41c64e6d) + 0x6073; return this.seed; }
        this.getRand = () => { return this.advance() >>> 16;}
    }
}
class PokeGearCall{
    chara = ["し", "カ", "ポ"];
    constructor(){
        this.callList = [];
        this.addCall = (call) => { this.callList.push(call); }
        this.removeCall = () => { this.callList.pop(); }
        this.clear = () => { this.callList = []; }
        this.getCallListStr = () => {
            if(this.callList.length == 0) return "";
            let txt = "";
            for(let i=0; i<this.callList.length-1; i++){
                txt += this.chara[this.callList[i]] + ",";
            }
            return txt + this.chara[this.callList[this.callList.length-1]];
        }
        this.checkSeed = (seed) => {
            const length = this.callList.length;
            let isEqual = true;
            const templcg = new LCG(seed>>>0);
            for(let i=0; i<length; i++){
                isEqual &= this.callList[i] == ((templcg.getRand()>>>0) % 3);
            }
            return isEqual;
        }
        this.doCalc = (targetSeed, frameRange, minsecRange, firstStep, lastStep)=>{
            if(lastStep > firstStep) return [];

            const l24_first = (targetSeed >>> 0) - (frameRange >>> 0);
            const u8_first = (targetSeed >>> 24) - (minsecRange >>> 0);

            let possibleSeedList = [];
            for (let u8 = 0; u8 <= 2 * minsecRange; u8++){
                for (let l24 = 0; l24 <= 2 * frameRange; l24++){
                    const array = [(u8_first + u8) << 24 | ((l24_first + l24) & 0xFFFFFF), l24 - frameRange, u8 - minsecRange ];
                    possibleSeedList.push(array);
                }
            }
            let res = [];
            for (let i=0;i< possibleSeedList.length; i++)
            {
                const templcg = new LCG(possibleSeedList[i][0]);
                for(let k=0; k<firstStep; k++){
                    templcg.advance();
                }
                for (let step = firstStep; step <= lastStep; step++)
                {
                    if (this.checkSeed(templcg.seed))
                        res.push([possibleSeedList[i][0], possibleSeedList[i][1], possibleSeedList[i][2], step, step + this.callList.length]);
                    templcg.advance();
                }
            }
            return res;
        }
    }
}

var callList = new PokeGearCall();
document.getElementById("button1").onclick = function(){ 
    callList.addCall(0);
    searchSeed();
    document.getElementById("callLog").value = callList.getCallListStr();
};
document.getElementById("button2").onclick = function(){ 
    callList.addCall(1);
    searchSeed();
    document.getElementById("callLog").value = callList.getCallListStr();
 };
document.getElementById("button3").onclick = function(){ 
    callList.addCall(2);
    searchSeed();
    document.getElementById("callLog").value = callList.getCallListStr();
};
document.getElementById("buttonBack").onclick = function(){
    callList.removeCall();
    searchSeed();
    document.getElementById("callLog").value = callList.getCallListStr();
}
document.getElementById("buttonClear").onclick = function(){
    callList.clear();
    const table = document.getElementById("resultTable");
    while(table.rows[1]) table.deleteRow(1);
    document.getElementById("callLog").value = callList.getCallListStr();
}

const lcg = new LCG(0);
function searchSeed(){
    const table = document.getElementById("resultTable");
    while(table.rows[1]) table.deleteRow(1);
    const targetSeed = parseInt(document.getElementById("targetSeedBox").value, 16);
    const frameRange = document.getElementById("frameRange").value;
    const minsecRange = document.getElementById("minsecRange").value;
    const preStep = [document.getElementById("preStepFirst").value, document.getElementById("preStepLast").value];
    const res = callList.doCalc(targetSeed, frameRange, minsecRange, preStep[0], preStep[1]);
    for(let i=0; i<res.length; i++){
        var rows = table.insertRow(-1);
        var cells = [rows.insertCell(0), rows.insertCell(1), rows.insertCell(2), rows.insertCell(3), rows.insertCell(4)];
        cells[0].innerHTML = zeroPadding(res[i][0]);
        cells[1].innerHTML = res[i][1];
        cells[2].innerHTML = res[i][2];
        cells[3].innerHTML = res[i][3];
        cells[4].innerHTML = res[i][4]>>>0;
    }
}

function zeroPadding(num){
    return ('0000000000' + (num>>>0).toString(16)).slice(-8);
}
function mult32(a,b){
    const c = a >>> 16;
    const d = a & 0x0000FFFF;
    const e = b >>> 16;
    const f = b & 0x0000FFFF;
    const g = (c*f + d*e) & 0x0000FFFF;
    return (g << 16) + d*f;
}