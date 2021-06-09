/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

 //A1 conectothermistor -> programo A1

//A0 conecto heat -> programo A0
//A14 conecto canal con 2 ventis -> programo A2
//A13 conecto 1 venti  -> programo A3
//A11 conecto 1 venti  -> programo A4

enum pcr_times {
    //% block="15 seconds"
    fifteenseconds,
    //% block="20 seconds"
    twentyseconds,
    //% block="30 seconds"
    thirtyseconds,
    //% block="40 seconds"
    fortyseconds,
    //% block="1 minute"
    oneminute,
    //% block="2 minutes"
    twominutes,
    //% block="3 minutes"
    threeminutes,
    //% block="10 minutes"
    tenminutes
}

enum denature {
    //% block="94º"
    ninetyfour,
    //% block="98º"
    ninetyeight
}

enum anneal {
    //% block="60º"
    sixty,
    //% block="68º"
    sixtyeight
}

enum elongate {
    //% block="70º"
    seventy,
    //% block="72º"
    seventytwo
}


//% weight=100 color=#AA278D icon="\uf0c3"
namespace PCR { //mi icono de PCR en el desplegable

 


//% block="Start PCR" blockGap=8
//% weight=100 color=#FFA533
export function Start_PCR(): void {

} //cierro start_PCR


//% block="Denaturation at %value during %time" blockGap=8
//% weight=90 color=#AA278D
export function denaturation(value: denature, time: pcr_times): void {
 
    timeselection(time);
  
}//ciero denaturation block

//% block="Annealing at %value during %time" blockGap=8
//% weight=80 color=#AA278D
export function annealing(value: anneal, time: pcr_times): void {

    timeselection(time);

}//cierro block  

//% block="Elongation at %value during %time" blockGap=8
//% weight=70 color=#AA278D
export function elongation(value: elongate, time: pcr_times): void {
 
   timeselection(time);

} //close elongation block
 
} //close namespace 
