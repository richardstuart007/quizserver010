const bcrypt = require('bcrypt')
const serverRegister = (req, res, db) => {
  //..............................................................................
  //.  Check the data sent
  //.............................................................................
  const { email, name, password, fedid, fedcountry } = req.body
  console.log(email, name, password, fedid, fedcountry)

  if (!email || !name || !password) {
    console.log('Email or Name or Password empty')
    return res.status(400).json('Email or Name or Password empty')
  }
  //..............................................................................
  //.  Hash the password
  //.............................................................................
  const saltRounds = 10
  const hash = bcrypt.hashSync(password, saltRounds)
  //..............................................................................
  //.  Write to User and userspwd
  //.............................................................................
  db.transaction(trx => {
    trx
      .insert({
        uphash: hash,
        upemail: email
      })
      .into('userspwd')
      .returning('upemail')
      .then(() => {
        return trx('users')
          .returning('*')
          .insert({
            u_name: name,
            u_email: email,
            u_admin: false,
            u_fedid: fedid,
            u_fedcountry: fedcountry,
            u_showprogress: true,
            u_showscore: true,
            u_sortquestions: true,
            u_skipcorrect: true,
            u_dftmaxquestions: 5,
            u_dftowner: 'NZBridge',
            u_joined: new Date()
          })
          .then(user => {
            res.json(user[0])
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  }).catch(err => {
    console.log(err.detail)
    res.status(400).json('Error registering on server')
  })
}
//..............................................................................
//.  Exports
//.............................................................................
module.exports = {
  serverRegister: serverRegister
}
