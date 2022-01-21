import { get } from "./requests"
import { daysBetween } from "./convertCalc"


const LBS_PER_KG = 2.20462262185
// const LBS_PER_KG = 2.20462262
const KG_PER_LB = 0.45359237

const KG_PER_G = 0.001;
const NITROGEN_EXCRETION_DRY_COW = 0.5;
const NITROGEN_EXCRETION_HEIFER = 0.26;
const NITROGEN_EXCRETION_CALF = 0.14;

const PHOSPHORUS_EXCRETION_DRY_COW = 0.066;
const PHOSPHORUS_EXCRETION_HEIFER = 0.044;
const PHOSPHORUS_EXCRETION_CALF = 0.0099;

const POTASSIUM_EXCRETION_DRY_COW = 0.33;

const INORGANIC_SALT_EXCRETION_MILK_COW = 1.29;
const INORGANIC_SALT_EXCRETION_DRY_COW = 0.63;


export const getReportingPeriodDays = (baseUrl, dairy_id) => {
  return new Promise((res, rej) => {
    get(`${baseUrl}/api/dairy/${dairy_id}`)
      .then(([dairyInfo]) => {
        dairyInfo = dairyInfo && dairyInfo.period_start && dairyInfo.period_end ? dairyInfo : { period_start: new Date(), period_end: new Date() }
        res(daysBetween(dairyInfo.period_start, dairyInfo.period_end))
      })
      .catch(err => {
        console.log(err)
        rej(err)
      })
  })
}

export default function calculateHerdManNKPNaCl(herdsObj, reporting_period_days) {
  let _herdCalc = {}
  let amtAvgMilkProduction = herdsObj.milk_cows[5]
  /**
   * This does not include the end date, so it's accurate if
   *  you're measuring your age in days, or the total days 
   *  between the start and end date. But if you want the duration
   *  of an event that includes both the starting date and the 
   *  ending date, then it would actually be 366 days.
   */
  reporting_period_days += 1  // add one day to include the duration of the end day
  // Documentaion says to use MaxCount but merced program is using AvgNumber
  let amtAvgMilkCowCount = herdsObj.milk_cows[3]


  let milk = amtAvgMilkProduction * KG_PER_LB;



  let lblHerdManurePerYearMilkCow = ((milk * 0.647) + 43.212) * LBS_PER_KG * amtAvgMilkCowCount * reporting_period_days;
  let tonsHerdManurePerYearMilkCow = lblHerdManurePerYearMilkCow / 2000;
  let lblHerdNPerYearMilkCow = amtAvgMilkCowCount * ((milk * 4.204) + 283.3) * KG_PER_G * LBS_PER_KG * reporting_period_days;
  let lblHerdPPerYearMilkCow = amtAvgMilkCowCount * ((milk * 0.773) + 46.015) * KG_PER_G * LBS_PER_KG * reporting_period_days;
  let lblHerdKPerYearMilkCow = amtAvgMilkCowCount * ((milk * 1.800) + 31.154) * KG_PER_G * LBS_PER_KG * reporting_period_days;
  let lblHerdSaltPerYearMilkCow = amtAvgMilkCowCount * INORGANIC_SALT_EXCRETION_MILK_COW * reporting_period_days;
  let milk_cows = [
    tonsHerdManurePerYearMilkCow, lblHerdNPerYearMilkCow,
    lblHerdPPerYearMilkCow, lblHerdKPerYearMilkCow, lblHerdSaltPerYearMilkCow
  ]
  _herdCalc['milk_cows'] = milk_cows


  // Documentaion says to use MaxCount but merced program is using AvgNumber
  let amtAvgDryCowCount = herdsObj.dry_cows[3]
  let amtDryCowAvgWeight = herdsObj.dry_cows[4]
  let lblHerdManurePerYearDryCow = (((amtDryCowAvgWeight / LBS_PER_KG) * 0.022) + 21.844) * LBS_PER_KG * amtAvgDryCowCount * reporting_period_days;
  let tonsHerdManurePerYearDryCow = lblHerdManurePerYearDryCow / 2000;
  let lblHerdNPerYearDryCow = amtAvgDryCowCount * NITROGEN_EXCRETION_DRY_COW * reporting_period_days;
  let lblHerdPPerYearDryCow = amtAvgDryCowCount * PHOSPHORUS_EXCRETION_DRY_COW * reporting_period_days;
  // let lblHerdKPerYearDryCow = amtAvgDryCowCount * POTASSIUM_EXCRETION_DRY_COW * reporting_period_days; 
  // Documentation says to use MaxMilkCowCount but it uses AvgMilkCowCount
  let lblHerdKPerYearDryCow = amtAvgMilkCowCount * POTASSIUM_EXCRETION_DRY_COW * reporting_period_days;
  let lblHerdSaltPerYearDryCow = amtAvgDryCowCount * INORGANIC_SALT_EXCRETION_DRY_COW * reporting_period_days;
  let dry_cows = [
    tonsHerdManurePerYearDryCow, lblHerdNPerYearDryCow, lblHerdPPerYearDryCow,
    lblHerdKPerYearDryCow, lblHerdSaltPerYearDryCow
  ]
  _herdCalc['dry_cows'] = dry_cows

  // Documentaion says to use MaxCount but merced program is using AvgNumber
  let amtAvgHeifer15To24Count = herdsObj.bred_cows[3]
  let amtHeifer15To24AvgWeight = herdsObj.bred_cows[4]

  let lblHerdManurePerYearHeifer15To24 = (((amtHeifer15To24AvgWeight / LBS_PER_KG) * 0.018) + 17.817) * LBS_PER_KG * amtAvgHeifer15To24Count * reporting_period_days;
  let tonsHerdManurePerYearHeifer15To24 = lblHerdManurePerYearHeifer15To24 / 2000;
  let lblHerdNPerYearHeifer15To24 = amtAvgHeifer15To24Count * NITROGEN_EXCRETION_HEIFER * reporting_period_days;
  let lblHerdPPerYearHeifer15To24 = amtAvgHeifer15To24Count * PHOSPHORUS_EXCRETION_HEIFER * reporting_period_days;

  let bred_cows = [
    tonsHerdManurePerYearHeifer15To24, lblHerdNPerYearHeifer15To24, lblHerdPPerYearHeifer15To24
  ]
  _herdCalc['bred_cows'] = bred_cows

  // Documentaion says to use MaxCount but merced program is using AvgNumber
  let amtAvgHeifer7To14Count = herdsObj.cows[3]
  let amtHeifer7To14AvgWeight = herdsObj.cows[4]
  let lblHerdManurePerYearHeifer7To14 = (((amtHeifer7To14AvgWeight / LBS_PER_KG) * 0.018) + 17.817) * LBS_PER_KG * amtAvgHeifer7To14Count * reporting_period_days;
  let tonsHerdManurePerYearHeifer7To14 = lblHerdManurePerYearHeifer7To14 / 2000;
  let lblHerdNPerYearHeifer7To14 = amtAvgHeifer7To14Count * NITROGEN_EXCRETION_HEIFER * reporting_period_days;
  let lblHerdPPerYearHeifer7To14 = amtAvgHeifer7To14Count * PHOSPHORUS_EXCRETION_HEIFER * reporting_period_days;

  let cows = [
    tonsHerdManurePerYearHeifer7To14, lblHerdNPerYearHeifer7To14, lblHerdPPerYearHeifer7To14
  ]
  _herdCalc['cows'] = cows

  let amtAvgCalf4To6Count = herdsObj.calf_old[3]
  let lblHerdManurePerYearCalf4To6 = 19 * amtAvgCalf4To6Count * reporting_period_days;
  let tonsHerdManurePerYearCalf4To6 = lblHerdManurePerYearCalf4To6 / 2000;
  let lblHerdNPerYearCalf4To6 = amtAvgCalf4To6Count * NITROGEN_EXCRETION_CALF * reporting_period_days;
  let lblHerdPPerYearCalf4To6 = amtAvgCalf4To6Count * PHOSPHORUS_EXCRETION_CALF * reporting_period_days;
  let calf_old = [
    tonsHerdManurePerYearCalf4To6, lblHerdNPerYearCalf4To6, lblHerdPPerYearCalf4To6
  ]
  _herdCalc['calf_old'] = calf_old


  let amtAvgCalfTo3Count = herdsObj.calf_young[3]
  let lblHerdManurePerYearCalfTo3 = 19 * amtAvgCalfTo3Count * reporting_period_days;
  let tonsHerdManurePerYearCalfTo3 = lblHerdManurePerYearCalfTo3 / 2000;
  let lblHerdNPerYearCalfTo3 = amtAvgCalfTo3Count * NITROGEN_EXCRETION_CALF * reporting_period_days;
  let lblHerdPPerYearCalfTo3 = amtAvgCalfTo3Count * PHOSPHORUS_EXCRETION_CALF * reporting_period_days;
  let calf_young = [
    tonsHerdManurePerYearCalfTo3, lblHerdNPerYearCalfTo3, lblHerdPPerYearCalfTo3
  ]
  _herdCalc['calf_young'] = calf_young



  let lblHerdManurePerYearTotal = lblHerdManurePerYearMilkCow + lblHerdManurePerYearDryCow + lblHerdManurePerYearHeifer15To24 + lblHerdManurePerYearHeifer7To14 + lblHerdManurePerYearCalf4To6 + lblHerdManurePerYearCalfTo3;
  let tonsHerdManurePerYearTotal = lblHerdManurePerYearTotal / 2000;
  let lblHerdNPerYearTotal = lblHerdNPerYearMilkCow + lblHerdNPerYearDryCow + lblHerdNPerYearHeifer15To24 + lblHerdNPerYearHeifer7To14 + lblHerdNPerYearCalf4To6 + lblHerdNPerYearCalfTo3;
  let lblHerdPPerYearTotal = lblHerdPPerYearMilkCow + lblHerdPPerYearDryCow + lblHerdPPerYearHeifer15To24 + lblHerdPPerYearHeifer7To14 + lblHerdPPerYearCalf4To6 + lblHerdPPerYearCalfTo3;
  let lblHerdKPerYearTotal = lblHerdKPerYearMilkCow + lblHerdKPerYearDryCow;
  let lblHerdSaltPerYearTotal = lblHerdSaltPerYearMilkCow + lblHerdSaltPerYearDryCow;

  let totals = [
    tonsHerdManurePerYearTotal, lblHerdNPerYearTotal, lblHerdPPerYearTotal, lblHerdKPerYearTotal, lblHerdSaltPerYearTotal
  ]
  _herdCalc['totals'] = totals

  return _herdCalc
}