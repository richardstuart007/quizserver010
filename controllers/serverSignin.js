//==================================================================================
//= Process a Signin fetch request from server route
//==================================================================================
const { format } = require('date-fns')
const serverSigninHandler = require('./serverSigninHandler')
//
// Constants
//
const debugLog = false
const reference = 'serverSignin'
//
//  Global Variable - Define return object
//
const CatchFunction = 'serverSignin'
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
//= Signin a User
//==================================================================================
async function serverSignin(req, res, db, logCounter) {
  //
  //  Time Stamp
  //
  const TimeStamp = format(new Date(), 'yyLLddHHmmss')
  let logMessage = `Handler. ${logCounter} Time:${TimeStamp}`

  try {
    //
    // Initialise Global Variables
    //
    returnObject.returnValue = false
    returnObject.returnMessage = ''
    returnObject.returnSqlFunction = ''
    returnObject.returnCatchFunction = ''
    returnObject.returnCatch = ''
    returnObject.returnCatchMsg = ''
    returnObject.returnRows = []
    //..................................................................................
    //. Check values sent in Body
    //..................................................................................
    const bodyParms = req.body
    const { email, password } = bodyParms
    //
    //  Check required parameters
    //
    if (!email || !password) {
      returnObject.returnMessage = `Email or Password empty`
      returnObject.returnCatchFunction = CatchFunction
      return res.status(400).json(returnObject)
    }
    //
    // Process Request Promises(ALL)
    //
    const returnData = await Promise.all([serverSigninHandler.serverSigninHandler(db, bodyParms)])
    if (debugLog) console.log(`returnData `, returnData)
    //
    // Parse Results
    //
    const returnDataObject = returnData[0]
    returnObject = Object.assign({}, returnObject, returnDataObject)
    //
    //  Error
    //
    const returnValue = returnObject.returnValue
    if (!returnValue) {
      if (debugLog)
        console.log(`HANDLER. ${logCounter} Time:${TimeStamp} ${reference} received No Data`)
      return res.status(400).send(returnObject)
    }
    //
    //  Log return values
    //
    const records = Object.keys(returnObject.returnRows).length
    logMessage = logMessage + `(${records})`
    console.log(logMessage)
    return res.status(200).json(returnObject.returnRows)
    //
    // Errors
    //
  } catch (err) {
    logMessage = logMessage + ` Error(${err.message})`
    console.log(logMessage)
    returnObject.returnCatch = true
    returnObject.returnCatchMsg = err.message
    returnObject.returnCatchFunction = CatchFunction
    return res.status(400).send(returnObject)
  }
}
//!==================================================================================
//! Exports
//!==================================================================================
module.exports = {
  serverSignin
}
