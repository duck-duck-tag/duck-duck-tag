import Database from 'better-sqlite3'


const writeResultsToSQLite = arg => {

    const filename  = arg.filename
    const result    = arg.result

    const insertIntoResultTable = (db,record) => {

        const values = [record.id, record.service, record.label, record.accuracy, record.type, record.path, record.time]

        // Tad less akward way to construct insert statement
        const statement = db.prepare('INSERT INTO result VALUES ('
            + '?,'.repeat(values.length - 1) + '?)')

        return statement.run(values)

    }



    const db = new Database(filename) // { verbose: console.log }

    // Create table if it does not exist
    const createStmt = db.prepare('CREATE TABLE IF NOT EXISTS result(id text, service text, label text, accuracy real, type text, path text, time text)')
    createStmt.run()


    
    const infos = result.map((record) => insertIntoResultTable(db,record))

    const numberOfInsertedRows = infos.reduce((p,c) => p + c.changes,0 )
        
    console.log('Inserted ',numberOfInsertedRows,' rows')

    db.close()

    return numberOfInsertedRows

}

export default writeResultsToSQLite