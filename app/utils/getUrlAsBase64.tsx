// https://stackoverflow.com/questions/41846669/download-an-image-using-axios-and-convert-it-to-base64

import axios  from 'axios'


const getUrlAsBase64 = (url: string) => {
  return axios.get(url, {
    responseType: 'arraybuffer'
  })
  .then(response =>  Buffer.from(response.data, 'binary').toString('base64'))

}     


export default getUrlAsBase64