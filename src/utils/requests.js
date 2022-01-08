import axios from "axios"

const get = (url) => {
  return fetch(url).then(res => res.json())
}

const getPDF = (url) => {
  return axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'Accept': 'application/pdf'
    }
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

const uploadFiles = (url, files) => {
  const formData = new FormData()
  for (let i = 0; i < files.length; i++) {
    // if(!['image/jpeg', 'image/png'].includes(files[i].type)){
    //   console.log("Invalid file type")
    //   // return
    // } 

    // The key 'images' dictates what variable is in req.files.VARNAME*
    formData.append("images", files[i])
  }

  return fetch(url, {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
}

export { get, getPDF, post, uploadFiles }