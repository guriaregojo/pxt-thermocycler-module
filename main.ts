

// 6x8 font
const Font_5x7 = hex`000000000000005F00000007000700147F147F14242A072A12231308646237495522500005030000001C2241000041221C00082A1C2A0808083E080800503000000808080808006060000020100804023E5149453E00427F400042615149462141454B311814127F1027454545393C4A49493001710905033649494936064949291E003636000000563600000008142241141414141441221408000201510906324979413E7E1111117E7F494949363E414141227F4141221C7F494949417F090901013E414151327F0808087F00417F41002040413F017F081422417F404040407F0204027F7F0408107F3E4141413E7F090909063E4151215E7F09192946464949493101017F01013F4040403F1F2040201F7F2018207F63140814630304780403615149454300007F4141020408102041417F000004020102044040404040000102040020545454787F484444383844444420384444487F3854545418087E090102081454543C7F0804047800447D40002040443D00007F10284400417F40007C041804787C0804047838444444387C14141408081414187C7C080404084854545420043F4440203C4040207C1C2040201C3C4030403C44281028440C5050503C4464544C44000836410000007F000000413608000201020402`

//% weight=100 color=#AA278D icon="\uf0c3"
namespace PCR { //mi icono de PCR en el desplegable

/*
/*inicializar pantalla*/
 
 export enum DISPLAY_ONOFF {
    //% block="ON"
    DISPLAY_ON = 1,
    //% block="OFF"
    DISPLAY_OFF = 0
 }
 
 const MIN_X = 0
 const MIN_Y = 0
 const MAX_X = 127
 const MAX_Y = 63
 
 let _I2CAddr = 60
 let _screen = pins.createBuffer(1025)
 let _buf2 = pins.createBuffer(2)
 let _buf3 = pins.createBuffer(3)
 let _buf4 = pins.createBuffer(4)
 let _buf7 = pins.createBuffer(7)
 _buf7[0] = 0x40
 let _DRAW = 1
 let _cx = 0
 let _cy = 0
 
 function cmd1(d: number) {
    let n = d % 256;
    pins.i2cWriteNumber(_I2CAddr, n, NumberFormat.UInt16BE);
 }
 
 function cmd2(d1: number, d2: number) {
    _buf3[0] = 0;
    _buf3[1] = d1;
    _buf3[2] = d2;
    pins.i2cWriteBuffer(_I2CAddr, _buf3);
 }
 
 function cmd3(d1: number, d2: number, d3: number) {
    _buf4[0] = 0;
    _buf4[1] = d1;
    _buf4[2] = d2;
    _buf4[3] = d3;
    pins.i2cWriteBuffer(_I2CAddr, _buf4);
 }
 
 function set_pos(col: number = 0, page: number = 0) {
    cmd1(0xb0 | page) // page number
    cmd1(0x00 | (col % 16)) // lower start column address
    cmd1(0x10 | (col >> 4)) // upper start column address    
 }
 
 // clear bit
 function clrbit(d: number, b: number): number {
    if (d & (1 << b))
        d -= (1 << b)
    return d
 }
 
 //draw refresh screen
 
 function draw(d: number) {
    if (d > 0) {
        set_pos()
        pins.i2cWriteBuffer(_I2CAddr, _screen)
    }
 }
 
 function char(c: string, col: number, row: number, color: number = 1) {
    let p = (Math.min(127, Math.max(c.charCodeAt(0), 32)) - 32) * 5
    let ind = col + row * 128 + 1
 
    for (let i = 0; i < 5; i++) {
        _screen[ind + i] = (color > 0) ? Font_5x7[p + i] : Font_5x7[p + i] ^ 0xFF
        _buf7[i + 1] = _screen[ind + i]
    }
    _screen[ind + 5] = (color > 0) ? 0 : 0xFF
    _buf7[6] = _screen[ind + 5]
    set_pos(col, row)
    pins.i2cWriteBuffer(_I2CAddr, _buf7)
 }
 
 /*show text in OLED"show string %s|at col %col|row %row|color %color"*/
 export function String(s: string, col: number, row: number, color: number = 1) {
    for (let n = 0; n < s.length; n++) {
        char(s.charAt(n), col, row, color)
        col += 6
        if (col > (MAX_X - 6)) return
    }
 }
 
 /**
 * show a number in OLED*/
 export function Number(num: number, col: number, row: number, color: number = 1) {
    String(num.toString(), col, row, color)
 }
 
 function scroll() {
    _cx = 0
    _cy++
    if (_cy > 7) {
        _cy = 7
        _screen.shift(128)
        _screen[0] = 0x40
        draw(1)
    }
 }
 

 /**
 * clear screen
 */
 
 export function clear() {
    _cx = _cy = 0
    _screen.fill(0)
    _screen[0] = 0x40
    draw(1)
 }
 
 /**
 * OLED initialize
 */
 export function init() {
    cmd1(0xAE)       // SSD1306_DISPLAYOFF
    cmd1(0xA4)       // SSD1306_DISPLAYALLON_RESUME
    cmd2(0xD5, 0xF0) // SSD1306_SETDISPLAYCLOCKDIV
    cmd2(0xA8, 0x3F) // SSD1306_SETMULTIPLEX
    cmd2(0xD3, 0x00) // SSD1306_SETDISPLAYOFFSET
    cmd1(0 | 0x0)    // line #SSD1306_SETSTARTLINE
    cmd2(0x8D, 0x14) // SSD1306_CHARGEPUMP
    cmd2(0x20, 0x00) // SSD1306_MEMORYMODE
    cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
    cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
    cmd1(0xa0 | 0x1) // SSD1306_SEGREMAP
    cmd1(0xc8)       // SSD1306_COMSCANDEC
    cmd2(0xDA, 0x12) // SSD1306_SETCOMPINS
    cmd2(0x81, 0xCF) // SSD1306_SETCONTRAST
    cmd2(0xd9, 0xF1) // SSD1306_SETPRECHARGE
    cmd2(0xDB, 0x40) // SSD1306_SETVCOMDETECT
    cmd1(0xA6)       // SSD1306_NORMALDISPLAY
    cmd2(0xD6, 0)    // zoom off ->->->->->->->->->->->->->->->-> igual si pongo 1 me salen mas grandes los pixels
    cmd1(0xAF)       // SSD1306_DISPLAYON
    clear()
 }
 init();
 //////// HASTA AQUI HE CREADO TODAS LAS FUNCIONES QUE VOY A USAR EN MI OLED

 //block scope es todo lo que va entre {} por ejemplo un if,for y while{} son en si mismos un block scope
// var: globally or function scoped and can be redeclared and reupdated. 
//let (updated) y const (no updated): block scoped
 // voy a declarar las variables con VAR en cada bloque


 //let fullcycle: number=0;
 let start : number=0;
let themillis: number=0;
 let totalmillis: number=0;
  ////THERMISTOR READING RESISTANCE////////
let SERIESRESISTOR: number=1000 /// the value of the extra resistor (measure exact with multi)
let THERMISTRESISTOR:number=890; //el mio
let average: number=0
let i: number=0;
let sum: number=0;
let B_param_equation:  number=0;
let tempCelsius: number=0;
let tempFarenheit: number=0;

//% block="truncate" blockGap=8
//% weight=100 color=#FFA533
export function hello(): void {


//while (totalmillis<=60*1000){
    //////TEXT START PCR
//start=control.millis();
//pause(1000); //give time for OLED to initialize
 //String(" START PCR",40,50,1); //meter un espacio antes de la "S"
//clear();
 //pause(2000);
 //borro todo por si acaso

                //pins.A2.digitalWrite(false);
                //pins.A3.digitalWrite(false);
                //pins.A4.digitalWrite(false);
     //pause(2000);
                //pins.A2.digitalWrite(true);
                //pins.A3.digitalWrite(true);
                //pins.A4.digitalWrite(true);
 //pause(2000);
 themillis=control.millis()-start;
 //Number(themillis,20,60,1);
 //pause(1000)

    //totalmillis=themillis+totalmillis;
  //String(" Hey",40,50,1); //meter un espacio antes de la "S"
  //Number(totalmillis,20,60,1);


for (i=0; i< 5; i++){  //coger 5 samples
sum=sum+pins.A1.analogRead();
pause(10);
}
average=sum/5;
 sum=0;

 // convert the value to resistance
 average = 1023 / average - 1;
 average = SERIESRESISTOR / average;

////THERMISTOR CALCULATING TEMPERATURE
B_param_equation = ((Math.log(average / THERMISTRESISTOR))/3950)+(1/(25+273.15)); //(1/To)+ 1/B * ln(R/Ro)
B_param_equation = 1.0 / B_param_equation;  // Inverse
B_param_equation = B_param_equation -273.15;  //from kelving to celcius
tempCelsius=B_param_equation;
tempCelsius=Math.round(tempCelsius * 100) / 100
tempFarenheit = (tempCelsius * 1.8) + 32;
tempFarenheit=Math.round(tempFarenheit * 100) / 100
///////////////////////////////////////////////////*/
 //DISPLAY TEMPERATURE ON SCREEN:
  String(" Temperature: ",20,2,1); //meter un espacio antes de la "S"
  Number(tempCelsius,20,4,1);
  String(" Celsius: ",60,4,1); //meter un espacio antes de la "S"
  Number(tempFarenheit,15,6,1);
  String(" Farenheit: ",60,6,1); //meter un espacio antes de la "S"
  pause(2000);
  clear();

//}//close while


   } //close prueba block
 

} //close namespace 



