/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

//A0 heat y A1,A2,A3 son ventiladores

enum denaturation {
    //% block="94º"
    ninetyfour,
    //% block="98º"
    ninetyeight
}

enum annealing {
    //% block="60º"
    sixty,
    //% block="68º"
    sixtyeight
}

enum elongation {
    //% block="70º"
    seventy,
    //% block="72º"
    seventytwo
}

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
    threeminutes
    //% block="10 minutes"
    tenminutes
}

//% weight=100 color=#FF5733 icon="\uf021"
namespace PCR { //mi icono de PCR en el desplegable

/* 2)inicializar pantalla*/
 // 6x8 font
 const Font_5x7 = hex`000000000000005F00000007000700147F147F14242A072A12231308646237495522500005030000001C2241000041221C00082A1C2A0808083E080800503000000808080808006060000020100804023E5149453E00427F400042615149462141454B311814127F1027454545393C4A49493001710905033649494936064949291E003636000000563600000008142241141414141441221408000201510906324979413E7E1111117E7F494949363E414141227F4141221C7F494949417F090901013E414151327F0808087F00417F41002040413F017F081422417F404040407F0204027F7F0408107F3E4141413E7F090909063E4151215E7F09192946464949493101017F01013F4040403F1F2040201F7F2018207F63140814630304780403615149454300007F4141020408102041417F000004020102044040404040000102040020545454787F484444383844444420384444487F3854545418087E090102081454543C7F0804047800447D40002040443D00007F10284400417F40007C041804787C0804047838444444387C14141408081414187C7C080404084854545420043F4440203C4040207C1C2040201C3C4030403C44281028440C5050503C4464544C44000836410000007F000000413608000201020402`


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
 
 // set pixel in OLED: "OLED12864_I2C_PIXEL" block="set pixel at x %x|y %y|color %color"*/
 
 export function pixel(x: number, y: number, color: number = 1) {
    let page = y >> 3
    let shift_page = y % 8
    let ind = x + page * 128 + 1
    let b = (color) ? (_screen[ind] | (1 << shift_page)) : clrbit(_screen[ind], shift_page)
    _screen[ind] = b
    if (_DRAW) {
        set_pos(x, page)
        _buf2[0] = 0x40
        _buf2[1] = b
        pins.i2cWriteBuffer(_I2CAddr, _buf2)
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
 * print a Number in OLED"print number %num|color %color|newline %newline"*/
 
 export function printNumber(num: number, color: number, newline: boolean = true) {
    printString(num.toString(), color, newline)
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
 //////// HASTA AQUI HE CREADO TODAS LAS FUNCIONES QUE VOY A USAR EN MI OLED


//% block="Start the PCR" blockGap=8
//% weight=100 color=#FFA533
export function Start_PCR(): void {
 
    /* aqui:
  
  1) declararia constantes*/
  var thetime=0; 
  let thetime: number = 0;
  let count: number=0;
  //no se si esto esta bien declarado y si se peude leer en otras funciones
 //creo que no hay que declarar mis pines del rele
 
    //AHORA INICIALIZO PANTALLA DE VERDAD
    init() //inicializo pantalla
    pause(1000) //give time for OLED to initialize
    String("START PCR",10,10,1)
    String("Heating to 94-96",20,40,1)
    pause(1000) //give time for OLED to initialize
    clear() //borro todo por si acaso

    - /*3) inicializar sensor*/

    //4) calentaria a 94º o sea seria mi case 0
        while (changeblock==0){
        //lectura temperatura + proyeccion en oled
        if(tempCelsius<=55){ 
                //calentar hasta detectar 55º con intencion de que llegue a 94º
                pins.A0.digitalWrite(false) //calentar
                //do medir temperatura + proyectar en oled
            }
        else{
            pins.A0.digitalWrite(true)
            pins.A1.digitalWrite(true)
            pins.A2.digitalWrite(true)
            pins.A3.digitalWrite(true)
            }
        if(tempCelsius>=90){
            changeblock=1;
            totalmillis=0;}
        else{}
        }//cierro while
} //cierro start_PCR


//% block="Denaturation at %value during %time" blockGap=8
//% weight=90 color=#FF5733
export function denaturation(value: denaturation, time: pcr_times): void {
    switch(time) { //son como mis counts
        case pcr_times.fifteen: thetime=15000;break; //fifteenseconds=15000ms
        case pcr_times.twentyseconds: thetime=20000;break;
        case pcr_times.thirtyseconds: thetime=30000;break;
        case pcr_times.fortyseconds: thetime=40000;break;
        case pcr_times.oneminute: thetime=60000;break;
        case pcr_times.twominutes: thetime=2*60000;break;
        case pcr_times.threeminutes: thetime=3*60000;break;
        case pcr_times.tenminutes: thetime=10*60000;break;
    }
    totalmillis=0;
    while (changeblock==1){
        var start=Date.now(); //number of milliseconds ellapsed since january 1
        //lectura temperatura + proyeccion en pantalla
        switch(value) {
               case denaturation.ninetyfour: 
               if (totalmillis<=thetime){ //denature initialize: x mins a x temperaturaº, esta calculado que 1 count= 2 segundos
                   if (tempCelsius<=94){ 
                       pins.A0.digitalWrite(false)
                       if (tempCelsius>90 && tempCelsius<=92) {
                       pause(2000); 
                       }
                       else if (tempCelsius<=90){
                       pause(3000); 
                       }
                       else {
                       pause(1500);
                      }
                   }
               else if (tempCelsius>=94.5){
                       pins.A1.digitalWrite(false)
                       pins.A2.digitalWrite(false)
       
                       if (tempCelsius>=96){
                        pause(3000);
                        }

                       else if (tempCelsius>=95){
                        pause(3000);
                       }
                       else{
                        pause(1000);
                       }
                   }
               else{} 
                   pins.A0.digitalWrite(true);
                   pins.A1.digitalWrite(true);
                   pins.A2.digitalWrite(true);
                   pins.A3.digitalWrite(true);
               }//cierro if count<<thetime
               else{
                   changeblock=2; //salgo del while
                   //textos para stop denature
                }
               
               break; //cierro case 94º
                       
               case denaturation.ninetyeight: 
               //aqui aguanta la temperatura a 98 grados
               break;//cierro case 98º
        } //cierra switch
        var millis=Date.now()-start
        totalmillis=millis+totalmillis
    }//cierra while
}

//% block="Annealing at %value during %time" blockGap=8
//% weight=90 color=#FF5733
export function annealing(value: annealing, time: pcr_times): void {
    switch(time) { //son como mis counts
        case pcr_times.fifteen: thetime=8;break;
        case pcr_times.twentyseconds: thetime=10;break;
        case pcr_times.thirtyseconds: thetime=15;break;
        case pcr_times.fortyseconds: thetime=20;break;
        case pcr_times.oneminute: thetime=30;break;
        case pcr_times.twominutes: thetime=60;break;
        case pcr_times.threeminutes: thetime=180;break;
        case pcr_times.tenminutes: thetime=300;break;
    }
    while (changeblock==2){
    //lectura temperatura + proyeccion en oled
    pins.A1.digitalWrite(false); //enfriar
    pins.A2.digitalWrite(false);
    pins.A3.digitalWrite(false);
    if(tempCelsius<=69){
        changeblock=3;
        totalmillis=0;}
    else{}
    }//cierro while

    while (changeblock==3){
    const start=Date.now();
    ///lectura temperatura + proyeccion en oled
    switch(value) {
        case annealing.sixtyeight: 
            if (count<=thetime){ 
                if (tempCelsius<=68){ 
                    pins.A0.digitalWrite(false) //calentar
                    if (tempCelsius>67 && tempCelsius<=66) {
                    pause(2000); 
                    count++;
                    }
                    else if (tempCelsius<=64){
                    pause(5000);
                    count++; 
                    count++;}
                    else {
                    delay(1000);
                    }
                }
                else if (tempCelsius>=69){
                    pins.A1.digitalWrite(false)
                    pins.A2.digitalWrite(false)
                    if (tempCelsius>=70){
                    pause(1500);
                    count++;
                    }
                    else {
                    pause(800); 
                    }
                } 
                else{
                    pins.A0.digitalWrite(true)
                    pins.A1.digitalWrite(true)
                    pins.A2.digitalWrite(true)
                    pins.A3.digitalWrite(true)
                    count++; 
                }
            }//cierro if count
            else{
                changeblock=4;
                count=0;
                //stop annealing text
            }
            break;
            case annealing.sixty: 
            //do things for sixty
            break;
            } //cierra switch
        } //cierro while
}  

//% block="Elongation at %value during %time" blockGap=8
//% weight=90 color=#FF5733
export function elongation(value: elongation, time: pcr_times): void {
    
    switch(time) { //son como mis counts
        case pcr_times.fifteen: thetime=8;break;
        case pcr_times.twentyseconds: thetime=10;break;
        case pcr_times.thirtyseconds: thetime=15;break;
        case pcr_times.fortyseconds: thetime=20;break;
        case pcr_times.oneminute: thetime=30;break;
        case pcr_times.twominutes: thetime=60;break;
        case pcr_times.threeminutes: thetime=180;break;
        case pcr_times.tenminutes: thetime=300;break;
    }

    while (changeblock==4){
    //lectura temperatura + proyeccion en oled
    if(tempCelsius<=70){
    pins.A0.digitalWrite(false) //calentar
    }
    else{
        pins.A0.digitalWrite(true)
        if(tempCelsius>=72){
            changeblock=5;
            count=0;
            //textos elongation step
        }
        else{}
    }
    }


    while (changeblock==5){
    ///lectura temperatura + proyeccion en oled
    switch(value) {
        case elongation.seventytwo: 
            if (count<=thetime){ 
                if (tempCelsius<=72){ 
                    pins.A0.digitalWrite(false) //calentar
                    if (tempCelsius>71 && tempCelsius<=70) {
                    pause(3000); 
                    count++;
                    }
                    else if (tempCelsius<=68){
                    pause(5000);
                    count++; 
                    count++;}
                    else {
                   pause(1000);
                    }
                }
                else if (tempCelsius>=70){
                    pins.A1.digitalWrite(false)
                    pins.A2.digitalWrite(false)
                    if (tempCelsius>=74){
                    pause(1500);
                    count++;
                    }
                    else {
                    pause(800); 
                    }
                } 
                else{}
                    pins.A0.digitalWrite(false)
                    pins.A1.digitalWrite(false)
                    pins.A2.digitalWrite(false)
                    pins.A3.digitalWrite(false)
                    count++; 
                
            }//cierro if count
            else{
                changeblock=1; //back to denature a no ser que se hayan acabado los ciclos
                count=0;
                //stop elongation text
            }
            break;
            case elongation.seventy: 
            //do things for seventy
            break;
            } //cierra switch
        } //cierro while
}  
} //close namespace 

