export default function mTea() { }

const TO_MG_KG = 1e4    // converts percent to decimal 1e-2 and mg to kg 1e6 ex=> 0.5% is .005 as a decimal
const TO_KG_MG = 1e-4       //        if 5% of 1 kg is nitrogen, how many mg is that. 1kg == 1mg * 1e6. ==> (0.5%)*1e-2 * 1mg * 1e6 == (0.5)1mg*1e4 == .5e4mg == 5000mg / kg

const toFloat = (num) => {
  const float = num && typeof (num) === typeof ('') && num.length > 0 ? parseFloat(num.replaceAll(',', '')) : typeof (num) === typeof (0) || typeof (num) === typeof (0.0) ? num : 0

  if (isNaN(float)) {
    throw `${float} is not a number`
  }
  return float
}

const zeroTimeDate = (dt) => {
  if (!dt) {
    throw `Invalid date given ${dt}`
  }

  return new Date(`${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`)
}

const daysBetween = (d1, d2) => {
  if (!d1 || !d2) {
    throw `Invalid dates given: ${d1} - ${d2}`
  }
  // console.log("Calculating days between", d1, d2)
  return Math.abs(Math.round((zeroTimeDate(new Date(d2)) - zeroTimeDate(new Date(d1))) / 86400000))
}

const MG_KG = (num) => {
  let val = (parseFloat(num) * TO_MG_KG)
  return Math.round((val + Number.EPSILON) * 1e6) / 1e6
}
const KG_MG = (num) => {
  let val = parseFloat(num) * TO_KG_MG
  return Math.round((val + Number.EPSILON) * 1e6) / 1e6
}

export { TO_MG_KG, TO_KG_MG, toFloat, zeroTimeDate, daysBetween, MG_KG, KG_MG }