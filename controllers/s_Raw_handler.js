//!==================================================================================
//! Run Raw SQL
//!==================================================================================
//
// Constants
//
const log = false
const reference = 's_Raw_handler'
//
//  Global Variable - Define return object
//
const CatchFunction = 's_Raw_handler'
const SqlFunction = 's_Raw_handler'
var returnObject = {
  returnValue: '',
  returnMessage: '',
  returnSqlFunction: '',
  returnCatchFunction: '',
  returnCatch: false,
  returnCatchMsg: '',
  returnRows: []
}
//==================================================================================
//= Main ASYNC Function
//==================================================================================
async function f_handleRaw(db, bodyParms) {
  try {
    //
    // Initialise Global Variables
    //
    returnObject.returnValue = false
    returnObject.returnMessage = ''
    returnObject.returnSqlFunction = SqlFunction
    returnObject.returnCatchFunction = ''
    returnObject.returnCatch = ''
    returnObject.returnCatchMsg = ''
    returnObject.returnRows = []
    //..................................................................................
    //. Parameter Validation
    //..................................................................................
    //
    //  Destructure Parameters
    //
    const {
      sqlAction,
      sqlString,
      sqlTable,
      sqlWhere,
      sqlOrderByRaw,
      sqlRow,
      sqlKeyName
    } = bodyParms
    if (log)
      console.log(`${reference} - sqlAction ${sqlAction} sqlRow ${sqlRow} `)
    //
    // Check values sent
    //
    if (!sqlAction) {
      returnObject.returnValue = false
      returnObject.returnMessage = `SqlAction parameter not passed`
      return returnObject
    }
    //
    //  Validate sqlAction type
    //
    if (
      sqlAction !== 'DELETE' &&
      sqlAction !== 'EXIST' &&
      sqlAction !== 'SELECTSQL' &&
      sqlAction !== 'SELECT' &&
      sqlAction !== 'INSERT' &&
      sqlAction !== 'UPDATE' &&
      sqlAction !== 'UPSERT'
    ) {
      returnObject.returnValue = false
      returnObject.returnMessage = `SqlAction ${sqlAction}: SqlAction not valid`
      return returnObject
    }
    //
    //  SELECTSQL needs sqlString
    //
    if (sqlAction === 'SELECTSQL' && !sqlString) {
      returnObject.returnValue = false
      returnObject.returnMessage = `SqlAction ${sqlAction}: sqlString not passed`
      return returnObject
    }
    //
    //  not SELECTSQL needs table
    //
    if (sqlAction !== 'SELECTSQL' && !sqlTable) {
      returnObject.returnValue = false
      returnObject.returnMessage = `SqlAction ${sqlAction}: sqlTable not passed`
      return returnObject
    }
    //
    // Get Database record (ASYNC)
    //
    const responseSql = await f_handleRawAwait(
      db,
      sqlAction,
      sqlString,
      sqlTable,
      sqlWhere,
      sqlOrderByRaw,
      sqlRow,
      sqlKeyName
    )
    //
    // Return Results
    //
    await responseSql
    //
    // Update Return Values
    //
    if (responseSql[0]) {
      returnObject.returnValue = true
      returnObject.returnMessage = `SqlAction ${sqlAction}: SUCCESS`
      returnObject.returnRows = responseSql
    } else {
      returnObject.returnValue = false
      returnObject.returnMessage = `SqlAction ${sqlAction}: FAILED`
      returnObject.returnRows = responseSql
    }
    return returnObject
    //
    // Errors
    //
  } catch (err) {
    console.log(err.message)
    returnObject.returnCatch = true
    returnObject.returnCatchMsg = err.message
    returnObject.returnCatchFunction = CatchFunction
    return returnObject
  }
}
//!==================================================================================
//! Main function - Await
//!==================================================================================
async function f_handleRawAwait(
  db,
  sqlAction,
  sqlString,
  sqlTable,
  sqlWhere,
  sqlOrderByRaw,
  sqlRow,
  sqlKeyName
) {
  //
  // Define Return Variable
  //
  var ResultSql = false
  //
  //
  try {
    switch (sqlAction) {
      case 'SELECTSQL':
        ResultSql = await db.select(db.raw(sqlString))
        break
      case 'SELECT':
        if (sqlOrderByRaw) {
          ResultSql = await db
            .select('*')
            .from(sqlTable)
            .whereRaw(sqlWhere)
            .orderByRaw(sqlOrderByRaw)
        } else {
          ResultSql = await db.select('*').from(sqlTable).whereRaw(sqlWhere)
        }
        break
      case 'UPDATE':
        ResultSql = await db
          .update(sqlRow)
          .from(sqlTable)
          .whereRaw(sqlWhere)
          .returning(['*'])
        break
      case 'DELETE':
        ResultSql = await db
          .del()
          .from(sqlTable)
          .whereRaw(sqlWhere)
          .returning(['*'])
        break
      case 'INSERT':
        ResultSql = await db
          .insert(sqlRow)
          .into(sqlTable)
          .returning(['*'])
          .onConflict(sqlKeyName)
          .ignore()
        break
      case 'UPSERT':
        ResultSql = await db
          .insert(sqlRow)
          .into(sqlTable)
          .returning(['*'])
          .onConflict(sqlKeyName)
          .merge()
        break
    }
    //
    // Return Record found
    //
    await ResultSql
    return ResultSql
    //
    // Errors
    //
  } catch (err) {
    console.log(err.message)
    returnObject.returnCatch = true
    returnObject.returnCatchMsg = err.message
    returnObject.returnCatchFunction = CatchFunction
    return null
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  f_handleRaw
}
