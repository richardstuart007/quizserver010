const bcrypt = require('bcrypt')
const serverSignin = (req, res, db) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json('Email or Password empty')
  }

  db.select('upemail', 'uphash')
    .from('userspwd')
    .where('upemail', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].uphash)
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('u_email', '=', email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json(`Error retrieving user ID: (${err})`))
      } else {
        res.status(400).json('Wrong credentials')
      }
    })
    .catch(err => res.status(400).json(`Wrong credentials: (${err})`))
}

module.exports = {
  serverSignin: serverSignin
}
