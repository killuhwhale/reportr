import { JWT_TOKEN } from "./constants"

const get = (url) => {
  const token = localStorage.getItem(JWT_TOKEN)
  return new Promise((resolve, reject) => {
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
      .then(res => {
        resolve(res.json())
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

const post = (url, data) => {
  const token = localStorage.getItem(JWT_TOKEN) ?? ''

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      redirect: "follow",
      refferrerPolicy: "no-referrer",
      body: JSON.stringify(data)
    })
      .then(res => {
        resolve(res.json())
      }
      )
      .catch(err => {
        console.log(err)
        reject(err)
      })

  })
}

const postXLSX = (url, data) => {
  const token = localStorage.getItem(JWT_TOKEN)
  return fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/octet-stream",
      "Authorization": `Bearer ${token}`
    },
    redirect: "follow",
    refferrerPolicy: "no-referrer",
    body: data
  })
    .then(res => res.json())
}

export { get, post, postXLSX }