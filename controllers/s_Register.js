const handleRegister = (req, res, db, bcrypt) => {
  //..............................................................................
  //.  Check the data sent
  //.............................................................................
  const { email, name, password, fedid } = req.body

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
      .then(email => {
        return trx('users')
          .returning('*')
          .insert({
            u_name: name,
            u_email: email,
            u_admin: false,
            u_fedid: fedid,
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
  handleRegister: handleRegister
}
