import AdmZip from 'adm-zip'

const zipFiles = (files,jobID,targetpath) => {

    const zip = new AdmZip();
    console.log('zipping ',files)
    files.forEach(file => zip.addLocalFile(file) )

    zip.writeZip(`${targetpath}/job ${jobID}.zip`)
}

export default zipFiles