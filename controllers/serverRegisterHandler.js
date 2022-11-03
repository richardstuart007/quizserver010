//!==================================================================================
//! Run Register SQL
//!==================================================================================
const bcrypt = require('bcrypt')
//
// Constants
//
const debugLog = false
const reference = 'serverRegisterHandler'
//
//  Global Variable - Define return object
//
const CatchFunction = 'serverRegisterHandler'
const SqlFunction = 'serverRegisterHandler'
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
async function serverRegisterHandler(db, bodyParms) {
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
      name,
      password,
      fedid,
      fedcountry,
      dftmaxquestions,
      dftowner,
      showprogress,
      showscore,
      sortquestions,
      skipcorrect,
      admin
    } = bodyParms
    if (debugLog) console.log(`${reference} - Register(${email}) name(${name})`)
    //
    // Get Database record (ASYNC)
    //
    const data = await updateDatabase(
      db,
      email,
      name,
      password,
      fedid,
      fedcountry,
      dftmaxquestions,
      dftowner,
      showprogress,
      showscore,
      sortquestions,
      skipcorrect,
      admin
    )
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
      returnObject.returnMessage = `Register User: SUCCESS`
      returnObject.returnRows = data
    } else {
      returnObject.returnValue = false
      returnObject.returnMessage = `Register User: FAILED`
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
async function updateDatabase(
  db,
  email,
  name,
  password,
  fedid,
  fedcountry,
  dftmaxquestions,
  dftowner,
  showprogress,
  showscore,
  sortquestions,
  skipcorrect,
  admin
) {
  //
  // Define Return Variable
  //
  let data_users = false
  //
  //
  try {
    if (debugLog) console.log('Start db transaction')
    //-------------------------------------------------------------
    //  Hash the password
    //-------------------------------------------------------------
    const saltRounds = 10
    const hash = bcrypt.hashSync(password, saltRounds)
    //-------------------------------------------------------------
    //  Userspwd Insert
    //-------------------------------------------------------------
    const data_userspwd = await db
      .insert({
        uphash: hash,
        upemail: email
      })
      .into('userspwd')
      .returning('*')

    await data_userspwd
    if (debugLog) console.log('data_userspwd ', data_userspwd)
    //-------------------------------------------------------------
    //  Users Insert
    //-------------------------------------------------------------
    const u_id = data_userspwd[0].upid
    if (debugLog) console.log('u_id ', u_id)
    data_users = await db
      .insert({
        u_id: u_id,
        u_name: name,
        u_email: email,
        u_admin: admin,
        u_fedid: fedid,
        u_fedcountry: fedcountry,
        u_showprogress: showprogress,
        u_showscore: showscore,
        u_sortquestions: sortquestions,
        u_skipcorrect: skipcorrect,
        u_dftmaxquestions: dftmaxquestions,
        u_dftowner: dftowner,
        u_joined: new Date()
      })
      .into('users')
      .returning('*')
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
  serverRegisterHandler
}
