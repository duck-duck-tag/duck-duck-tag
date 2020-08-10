/**
 * @jest-environment @jest-runner/electron/main
 */

import writeRowsToFile from './writeRowsToFile'
import fs  from 'fs'
import { ipcRenderer } from 'electron'

const sendResultsToMainForWritingToSQLite = (result,filename) => {

        // Data to send to main process
        const data = {
            result: result,
            filename: filename
        };

        console.log('sending this to main process' , data)

        // Main process has listener for action 'request-write-to-sqlite'
        // listener is in main.dev.ts
        ipcRenderer.send('request-write-to-sqlite', data);
    
   
}


const makeRowForCSV = result => { 
    return [result.id, result.service, result.label, result.accuracy,  result.type, result.path, result.time].join(';').concat('\n')
}

const createJSON = result => {
    
    const json = [JSON.stringify({ 'id': result.id, 'service': result.service, 'label': result.label, 'accuracy': result.accuracy, 'type': result.type, 'path': result.path, ts: new Date() })]

    //return [JSON.stringify({ 'id': result.id, 'service': result.service, 'label': result.label, 'accuracy': result.accuracy, 'type': result.type, 'path': result.path, ts: new Date() })] // WriteRowsToFile expects an array

    return [JSON.stringify({ result: result, ts: new Date() })] // WriteRowsToFile expects an array
}



const exportResults = (job, formatToExportTo: string, file='export') => {


    const filename = file.concat('.').concat( formatToExportTo === 'SQLite' ? 'db' : formatToExportTo.toLowerCase() )

    if (formatToExportTo === 'SQLite') {

        sendResultsToMainForWritingToSQLite(job.result,filename)

        return

    } 
    
    const rows = formatToExportTo === 'CSV' ? job.result.map(makeRowForCSV) : createJSON(job.result)

    writeRowsToFile(rows, filename)
}



export default exportResults