import { REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY, COMPANY_ID_KEY } from "./constants"
import { BASE_URL } from './environment'

/** Requests
 *  Auth:
 *    - Get and Post check each response for a 403 access token expired error
 *    - When the access token is expired, a request for a new token is made w/ the refreshToken
 *    - Once the accessToken is retrived, store in local storage
 *    - Then a request is made with the original url and data finally returning the response 
 *   
 */


// When sending reload requests, send the cache param  reload
// https://hacks.mozilla.org/2016/03/referrer-and-cache-control-apis-for-fetch/
const get = (url, cache = 'no-cache') => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const company_id = localStorage.getItem(COMPANY_ID_KEY)

  return new Promise((resolve, reject) => {
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Authorization-CompanyID": `ID ${company_id}`,
        cache: cache,
      },
    })
      .then(async res => {
        const { errorData, needsRefresh } = await checkForRefresh(res)
        if (needsRefresh) {
          const ogRes = await refreshToken(url, {}, 'get')
          resolve(ogRes)
        } else if (res.status === 403) {
          resolve(errorData)
        }
        else {
          resolve(res.json())
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

const getImage = (url) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const company_id = localStorage.getItem(COMPANY_ID_KEY)
  return new Promise((resolve, reject) => {
    fetch(url, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Authorization": `Bearer ${token}`,
        "Authorization-CompanyID": `ID ${company_id}`
      },
    })
      .then(async res => {
        const { errorData, needsRefresh } = await checkForRefresh(res)
        if (needsRefresh) {
          const ogRes = await refreshToken(url, {}, 'getImage')
          resolve(ogRes)
        } else if (res.status === 403) {
          resolve(errorData)
        }
        else {
          resolve(res.json())
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

const getFile = (url) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const company_id = localStorage.getItem(COMPANY_ID_KEY)
  return new Promise((resolve, reject) => {
    fetch(url, {
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": `Bearer ${token}`,
        "Authorization-CompanyID": `ID ${company_id}`,
        'cache': 'no-cache'
      },
    })
      .then(res => res.arrayBuffer())
      .then(async res => {
        const { errorData, needsRefresh } = await checkForRefresh(res)
        if (needsRefresh) {
          const ogRes = await refreshToken(url, {}, 'getFile')
          resolve(ogRes)
        } else if (res.status === 403) {
          resolve(errorData)
        }
        else {
          resolve(res)
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}


const checkForRefresh = async (res) => {
  // Returns data and a boolean needsRefresh
  // The data is the response data from the resolved json of the 403 response
  if (res.status === 403) {
    const errorData = await res.json()
    if (errorData.error === 'Expired') {
      return { errorData, needsRefresh: true }
    }
    return { errorData, needsRefresh: false }
  }
  return { errorData: {}, needsRefresh: false }
}

const refreshToken = (url, data, method) => {
  const company_id = localStorage.getItem(COMPANY_ID_KEY)
  const token = localStorage.getItem(REFRESH_TOKEN_KEY)
  return new Promise((resolve, reject) => {
    fetch(`${BASE_URL}/accounts/accessToken`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Authorization-CompanyID": `ID ${company_id}`
      },
      redirect: "follow",
      refferrerPolicy: "no-referrer",
      body: JSON.stringify({})
    })
      .then(async (res) => {
        if (res.error || res.status && res.status == 403) return resolve({ error: res.error })
        const result = await res.json()
        localStorage.setItem(ACCESS_TOKEN_KEY, result.token)

        // Make request again on behalf of original request and return results
        if (method === 'post') {
          post(url, data).then(ogRes => resolve(ogRes))
        }
        else if (method === "get") {
          get(url).then(ogRes => resolve(ogRes))
        }
        else if (method === "getImage") {
          getImage(url).then(ogRes => resolve(ogRes))
        }
        else if (method === "getFile") {
          getFile(url).then(ogRes => resolve(ogRes))
        }
        else if (method === "postXLSX") {
          postXLSX(url, data).then(ogRes => resolve(ogRes))
        } else if (method === 'postImage') {
          postImage(url, data).then(ogRes => resolve(ogRes))
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })

  })
}

const post = (url, data) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY) ?? ''
  const company_id = localStorage.getItem(COMPANY_ID_KEY)
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Authorization-CompanyID": `ID ${company_id}`
      },
      redirect: "follow",
      refferrerPolicy: "no-referrer",
      body: JSON.stringify(data)
    })
      .then(async (res) => {
        const { errorData, needsRefresh } = await checkForRefresh(res)

        if (needsRefresh) {
          console.log("Needs refresh: ", errorData, needsRefresh)
          // Making original request with new token.
          const ogRes = await refreshToken(url, data, 'post')
          resolve(ogRes)
        } else if (res.status === 403) {
          // console.log("403 but client should see error", errorData)
          resolve(errorData)
        } else {
          // Normal request
          resolve(res.json())
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })

  })
}

const postXLSX = (url, data) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const company_id = localStorage.getItem(COMPANY_ID_KEY)
  return fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/octet-stream",
      "Authorization": `Bearer ${token}`,
      "Authorization-CompanyID": `ID ${company_id}`
    },
    redirect: "follow",
    refferrerPolicy: "no-referrer",
    body: data
  })
    .then(async res => {
      const { errorData, needsRefresh } = await checkForRefresh(res)
      if (needsRefresh) {
        console.log("Needs refresh: ", errorData, needsRefresh)
        // Making original request with new token.
        const ogRes = await refreshToken(url, data, 'postXLSX')
        return ogRes
      } else if (res.status === 403) {
        console.log("403 but client should see error", errorData)
        return errorData
      } else {
        // Normal request
        return res.json()
      }
    })
}


// Essentailly a copy of postXLSX at this point, sending over raw array buffer of file.
// Might keep in case image are handled differently in the future.
const postImage = (url, data) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const company_id = localStorage.getItem(COMPANY_ID_KEY)
  return fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      // "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,
      "Authorization-CompanyID": `ID ${company_id}`
    },
    redirect: "follow",
    refferrerPolicy: "no-referrer",
    body: data
  })
    .then(async res => {
      const { errorData, needsRefresh } = await checkForRefresh(res)
      if (needsRefresh) {
        console.log("Needs refresh: ", errorData, needsRefresh)
        // Making original request with new token.
        const ogRes = await refreshToken(url, data, 'postImage')
        return ogRes
      } else if (res.status === 403) {
        console.log("403 but client should see error", errorData)
        return errorData
      } else {
        // Normal request
        return res.json()
      }
    })
}
export { get, getImage, getFile, post, postXLSX, postImage }