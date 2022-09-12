const handleRegister = (req, res, db, bcrypt) => {
  //..............................................................................
  //.  Check the data sent
  //.............................................................................
  const { email, name, password } = req.body

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
  //.  Write to User and Login
  //.............................................................................
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            name: name,
            email: email,
            joined: new Date()
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
