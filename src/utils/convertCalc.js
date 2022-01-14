

const MG_ML_TO_LBS_PER_GAL = 8.345e-6
const LBS_PER_GAL = 8.345
const TO_MG_KG = 1e4    // converts percent to decimal 1e-2 and mg to kg 1e6 ex=> 0.5% is .005 as a decimal
const TO_KG_MG = 1e-4       //        if 5% of 1 kg is nitrogen, how many mg is that. 1kg == 1mg * 1e6. ==> (0.5%)*1e-2 * 1mg * 1e6 == (0.5)1mg*1e4 == .5e4mg == 5000mg / kg

const toFloat = (num) => {
  const float = num && typeof (num) === typeof ('') && num.length > 0 ? parseFloat(num.replaceAll(',', '')) : typeof (num) === typeof (0) || typeof (num) === typeof (0.0) ? num : 0

  if (isNaN(float)) {
    throw `${float} is not a number`
    // return 0.0001337
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


const opArrayByPos = (a, b, op = "+") => {
  // Given two arrays of same length and an operator, apply the operation between the two values in each array by index
  return a.map((el, i) => {
    return op === '+' ? el + b[i] : op === '-' ? el - b[i] : op === '*' ? el * b[i] : op === '/' ? el / (b[i] != 0 ? b[i] : 1) : null
  })
}

const percentToDecimal = (num) => {
  return toFloat(num) * 1e-2
}


// Given a concentration and method of reporting, return the product 

const calcAmountLbsFromTons = (con, moisture, amount, method_of_reporting) => {
  /* 
    
     con: float, percentage
     moisture: float percentage
     amount: float, unit is tons
     method_of_reporting: if dry_weight, must take into account the moisture and only calculate the dry portion.
  */

  con = toFloat(con)
  moisture = toFloat(moisture)
  amount = toFloat(amount)

  amount *= 2000 // tons to lbs
  moisture *= 0.01
  moisture = Math.max(Math.min(1, moisture), 0.001) // mositure must be between 0.1% and 100%
  moisture = method_of_reporting === "dry-weight" ? (1 - moisture) : 1 // if reported as dry-weight, account for moisture
  return con * moisture * amount
}

const calcAmountLbsFromTonsPercent = (con, moisture, amount, method_of_reporting) => {
  /* 
  con: float, percentage
  moisture: float percentage
  amount: float, unit is tons
  method_of_reporting: if dry_weight, must take into account the moisture and only calculate the dry portion.
  */

  con = percentToDecimal(con)
  return calcAmountLbsFromTons(con, moisture, amount, method_of_reporting)
}

const mgKgToLbsFromTons = (con, moisture, amount, method_of_reporting) => {
  /* 
    
     con: float, percentage
     moisture: float percentage
     amount: float, unit is tons
     method_of_reporting: if dry_weight, must take into account the moisture and only calculate the dry portion.
  */

  con = toFloat(con)
  con *= 10e-7 // mg in a kg 1000 * 1000 = 1,000,000.0
  return calcAmountLbsFromTons(con, moisture, amount, method_of_reporting)
}


const displayPercentageAsMGKG = (num) => {
  // Used for harvest and manures as their concentrations are percentages of mg/ kg
  num = toFloat(num)
  return num * 1e4
}

const MGMLToLBS = (con_mg_ml, amt) => {
  // Gals to lbs
  // getNutrientBudgetA, converts total n p k applied from con
  con_mg_ml = toFloat(con_mg_ml)
  amt = toFloat(amt)

  return con_mg_ml * amt * MG_ML_TO_LBS_PER_GAL
}

const percentToLBSForGals = (con, amt) => {
  // Nutrient imports for  commerical liquid
  amt = toFloat(amt)
  return percentToDecimal(con) * amt * LBS_PER_GAL
}

const percentToLBS = (con, amt) => {
  // Nutrient imports for fertilizer 
  amt = toFloat(amt)
  return percentToDecimal(con) * amt
}

export {
  TO_MG_KG, TO_KG_MG, toFloat, zeroTimeDate, daysBetween, MG_KG, KG_MG,
  opArrayByPos, percentToDecimal, calcAmountLbsFromTons, calcAmountLbsFromTonsPercent,
  mgKgToLbsFromTons, displayPercentageAsMGKG, MGMLToLBS, percentToLBSForGals, percentToLBS
}