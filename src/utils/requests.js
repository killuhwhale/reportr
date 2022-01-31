



const get = (url) => {
  const token = localStorage.getItem('jwtToken')
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
  const token = localStorage.getItem('jwtToken')
  return fetch(url, {
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
    .then(res => res.json())
}

export { get, post }