const get = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
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
  return fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    redirect: "follow",
    refferrerPolicy: "no-referrer",
    body: JSON.stringify(data)
  })
    .then(res => res.json())
}

export { get, post }