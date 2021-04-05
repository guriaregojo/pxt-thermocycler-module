

//% weight=100 color=#FF5733 icon="\uf021"
namespace PCR { //mi icono de PCR en el desplegable

//% block="Start the PCR" blockGap=8
//% weight=100 color=#FFA533
export function Start_PCR(): void {
const sensor = require('ds18b20-raspi');
    const tempC = sensor.readSimpleC();
console.log(`${tempC} degC`);
 
// round temperature reading to 1 digit
const tempC = sensor.readSimpleC(1);
console.log(`${tempC} degC`);
 
 
// async version
sensor.readSimpleC((err, temp) => {
    if (err) {
        console.log(err);
    } else {
    console.log(`${temp} degC`);
    }
});
 
// round temperature reading to 1 digit
sensor.readSimpleC(1, (err, temp) => {
    if (err) {
        console.log(err);
    } else {
    console.log(`${temp} degC`);
    }
});

}  
} //close namespace 

