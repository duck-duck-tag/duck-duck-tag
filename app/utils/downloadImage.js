import axios from 'axios'
import fs from 'fs'


const downloadImage =  (url,imagefilename) => {

  
    console.log(`Downloading from ${url} and storing into ${imagefilename}`)


    return axios.get(url, { responseType: 'arraybuffer' }).then(response => {
        
        fs.writeFileSync(
            imagefilename
            ,Buffer.from(response.data,'base64')
        )
    })  
        

}


export default downloadImage
