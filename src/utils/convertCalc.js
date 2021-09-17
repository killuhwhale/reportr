export default function mTea(){}

export const TO_MG_KG = 1e4    // converts percent to decimal 1e-2 and mg to kg 1e6 ex=> 0.5% is .005 as a decimal
export const TO_KG_MG = 1e-4       //        if 5% of 1 kg is nitrogen, how many mg is that. 1kg == 1mg * 1e6. ==> (0.5%)*1e-2 * 1mg * 1e6 == (0.5)1mg*1e4 == .5e4mg == 5000mg / kg

export const toFloat = (num) => {
  return num && typeof(num) === typeof('') && num.length > 0 ? parseFloat(num.replaceAll(',', '')) : typeof(num) === typeof(0) || typeof(num) === typeof(0.0) ? num : 0
}

export const zeroTimeDate = (dt) => {
  return new Date(`${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`)
}

export const daysBetween = (d1, d2) => {
  // console.log("Calculating days between", d1, d2)
  return Math.round((zeroTimeDate(new Date(d2)) - zeroTimeDate(new Date(d1))) / 86400000)
}

export const  MG_KG = (num) => {
  let x = (parseFloat(num) * TO_MG_KG)
  return Math.round((x + Number.EPSILON) * 1e6) / 1e6
} 
export const  KG_MG = (num) => {
  let x = parseFloat(num) * TO_KG_MG
  return Math.round((x + Number.EPSILON) * 1e6) / 1e6
} 
