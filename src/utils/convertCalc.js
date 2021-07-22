export default function mTea(){}

export const TO_MG_KG = 1e4    // converts percent to decimal 1e-2 and mg to kg 1e6 ex=> 0.5% is .005 as a decimal
export const TO_KG_MG = 1e-4       //        if 5% of 1 kg is nitrogen, how many mg is that. 1kg == 1mg * 1e6. ==> (0.5%)*1e-2 * 1mg * 1e6 == (0.5)1mg*1e4 == .5e4mg == 5000mg / kg
export const  MG_KG = (num) => {
  let x = (parseFloat(num) * TO_MG_KG)
  return Math.round((x + Number.EPSILON) * 1e6) / 1e6
} 
export const  KG_MG = (num) => {
  let x = parseFloat(num) * TO_KG_MG
  return Math.round((x + Number.EPSILON) * 1e6) / 1e6
} 
