import { get, post } from '../../utils/requests';
const BASE_URL = `http://localhost:3001`

export default function mTEA(){}


export const getAnnualReportData = (dairy_id) => {
  let promises = [
    getDairyInformationA(dairy_id),
    // getDairyInformationB(dairy_id),
    getDairyInformationC(dairy_id),
  ]

  return new Promise((resolve, reject) => {
    Promise.all(promises)
    .then(results => {
      // now I have a list of results in order but I want to pass a single props object.
      // reduce each object in the list to a single object. Ea obj in the list has a single unique key.
      let resultsObj = results.reduce((a, c) => ({...a, ...c}))
      console.log(resultsObj)
      resolve(resultsObj)
    })
  })
}



const getDairyInformationA = (dairy_id) => {
  let promises = [
    get(`${BASE_URL}/api/dairy/${dairy_id}`),
    get(`${BASE_URL}/api/parcels/${dairy_id}`)
  ]
  
  return new Promise((resolve, rej) => {
    Promise.all(promises)
    .then(([dairy_info, parcels]) => {
      console.log(parcels)
      resolve({
        'dairyInformationA': dairy_info ? 
          {...dairy_info[0], parcels: parcels}: {},
      })
    })
    .catch(err => {
      console.log(err)
      rej(err)
    })  
  })
}

const getDairyInformationB = (dairy_id) => {
  // TODO add is_operator to table, need to add to UI as well to make sure the user can enable this.
  return new Promise((resolve, rej) => {  
    get(`${BASE_URL}/api/operators/is_operator/${encodeURIComponent(true)}/${dairy_id}`)
    .then((operators) => {
      resolve({
        'dairyInformationB': {
          operators
        }
      })
    })
    .catch(err => {
      console.log(err)
      rej(err)
    })  
  })
}

const getDairyInformationC = (dairy_id) => {
  // TODO add is_operator to table, need to add to UI as well to make sure the user can enable this.
  return new Promise((resolve, rej) => {  
    get(`${BASE_URL}/api/operators/is_owner/${encodeURIComponent(true)}/${dairy_id}`)
    .then((owners) => {
      resolve({
        'dairyInformationC': {
          owners
        }
      })
    })
    .catch(err => {
      console.log(err)
      rej(err)
    })  
  })
}


// /api/operators/is_owner/:is_owner/:dairy_id