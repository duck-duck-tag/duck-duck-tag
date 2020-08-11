import axios from 'axios'
import fs    from 'fs'


const downloadImage = async (url,imagefilename) => {

  
    console.log(`Downloading from ${url} and storing into ${imagefilename}`)


    return await axios.get(url, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFile(
                imagefilename
                ,Buffer.from(response.data,'base64')
                ,() => console.log(`Stored into ${imagefilename}`)
            )
        })    
        .catch(e => {
            console.log('problem downloading the image: ',e)
        })

}


export default downloadImage
