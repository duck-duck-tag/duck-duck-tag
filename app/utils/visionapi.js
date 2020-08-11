const fs    = require('fs')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const querystring = require('querystring')


const getFile = (path) => {
        return fs.readFileSync(path)
    }


const postaa = () => {

    // directly send a signed JWT to vision api: https://developers.google.com/identity/protocols/oauth2/service-account#jwt-auth
    // (substitute privateKey and mail with actual credentials)

    const privateKey = fs.readFileSync('privakey.txt')
    
    const mail = "client-email" // "client_email" from servicecredidentials
    
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 3600

    const payload = {
        iss: mail,
        sub: mail,
        aud: 'https://vision.googleapis.com/', 
        iat: iat,
        exp: exp
        
    }

  
    const token = jwt.sign(
        payload
        ,privateKey
        , { algorithm: 'RS256'}
    )


    // https://cloud.google.com/vision/docs/request#providing_the_image
    const localImage = Buffer.from(getFile('fruitbowl.jpg'), 'binary').toString('base64')



    // 2 eri sisältöä bodyyn: lokaali ja url

    // const image = {
    //     content: localImage
    // }

    const image = {
        source: {
            imageUri: "https://watson-developer-cloud.github.io/doc-tutorial-downloads/visual-recognition/fruitbowl.jpg"
        }
    }

    const body = {
        requests: [
            {
                image: image,
                features: [
                    {
                        type: "LABEL_DETECTION",
                        maxResults: 10
                    }
                ]
            }
        ]
    }

  
    const header =  {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }

    
    let URL = 'https://vision.googleapis.com/v1/images:annotate'
   
    return axios.post(URL, body, { headers: header }  )
                    .then(resp => {

                        console.log('responsemme',resp.data.responses ? resp.data.responses[0].labelAnnotations : resp)
                        console.log('status',resp.status ? resp.status : status)

                        return true
                    })
                    .catch(err => {
                        
                        console.log('Error tagging images:',err)
                        console.log('status',err.response.status)
                    })
        
}


postaa()
