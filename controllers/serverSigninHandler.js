//!==================================================================================
//! Run Signin SQL
//!==================================================================================
const bcrypt = require('bcrypt')
//
// Constants
//
const debugLog = false
const reference = 'serverSigninHandler'
//
//  Global Variable - Define return object
//
const CatchFunction = 'serverSigninHandler'
const SqlFunction = 'serverSigninHandler'
var returnObject = {
  returnValue: false,
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
async function serverSigninHandler(db, bodyParms) {
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
    //
    //  Destructure Parameters
    //
    const {
      email,

      password
    } = bodyParms
    if (debugLog) console.log(`${reference} - Signin(${email})`)
    //
    // Get Database record (ASYNC)
    //
    const data = await updateDatabase(db, email, password)
    //
    // Return Results
    //
    await data
    if (debugLog) console.log('data ', data)
    //
    // Update Return Values
    //
    if (data) {
      returnObject.returnValue = true
      returnObject.returnMessage = `Signin User: SUCCESS`
      returnObject.returnRows = data
    } else {
      returnObject.returnValue = false
      returnObject.returnMessage = `Signin User: FAILED`
      returnObject.returnRows = data
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
async function updateDatabase(db, email, password) {
  //
  // Define Return Variable
  //
  let data_users = false
  //
  //
  try {
    if (debugLog) console.log('Start db transaction')
    //-------------------------------------------------------------
    //  Userspwd GET
    //-------------------------------------------------------------
    const data_userspwd = await db.select('*').from('userspwd').where('upemail', '=', email)

    await data_userspwd
    if (debugLog) console.log('data_userspwd ', data_userspwd)
    //
    //  Userpwd not found
    //
    if (!data_userspwd) {
      return null
    }
    //-------------------------------------------------------------
    //  Validate password
    //-------------------------------------------------------------
    const valid = bcrypt.compareSync(password, data_userspwd[0].uphash)
    if (!valid) {
      return null
    }
    //-------------------------------------------------------------
    //  Users GET
    //-------------------------------------------------------------
    data_users = await db.select('*').from('users').where('u_email', '=', email)

    await data_users
    if (debugLog) console.log('data_users ', data_users)
    //-------------------------------------------------------------
    //  Return user added
    //-------------------------------------------------------------
    return data_users
    //-------------------------------------------------------------
    // Errors
    //-------------------------------------------------------------
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
  serverSigninHandler
}
