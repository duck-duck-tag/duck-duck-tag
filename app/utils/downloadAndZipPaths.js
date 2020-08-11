import downloadImage from '../utils/downloadImage'
import zipFiles from '../utils/zipFiles'

const downloadAndZipPaths = (paths,sessionJobID,whenDone) => {
    const files = []

    const downloads = paths.filter(path => path.type==='url').map(path => {

        let imagefilename = path.path.match(/\/[^/]+$/)

        if (!imagefilename) {
            console.log('what is the filename of image?')
        }
    
        imagefilename = `./downloaded-images/${sessionJobID}_${imagefilename[0].replace('/','')}`
    
        files.push(imagefilename)
        return downloadImage(path.path, imagefilename)
    })

    Promise.all(downloads)
          
        .then(() => {
            
            zipFiles(files,sessionJobID,'./downloaded-images')
        }).then(whenDone)
}

export default downloadAndZipPaths