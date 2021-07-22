export default function mTea(){}


export const isEmpty = (obj) => {
  return obj && obj != undefined && Object.keys(obj).length == 0
}