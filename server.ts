import express from 'express'
import cors from 'cors'
import loginRouter from './routes/loginRoute'
import userRouter from './routes/userRoute'
import attendenceRouter from './routes/attendenceRoute'
import breakRouter from './routes/breakRoute'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Public Route for Signin and Register user
app.use('/api/auth', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/atte`ndence', attendenceRouter)
app.use('/api/break', breakRouter)

// Listeing port
app.listen(3001, () => {
  console.log(`server is running on port ${3001}`)
})
