import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import axios from 'axios'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'

import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, unlink } = require('fs').promises

const Root = () => ''

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  console.log(Root)
} catch (ex) {
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser()
]

middleware.forEach((it) => server.use(it))

server.use((req, res, next) => {
  res.set('x-skillcrucial-user', '513e63fa-f0c7-49fb-96bf-478090c1d498')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
})

const saveUsersFile = async (users) => {
  await writeFile(`${__dirname}/users.json`, JSON.stringify(users), { encoding: 'utf8' })
}

const readUsersFile = async () => {
  // eslint-disable-next-line no-return-await
  return await readFile(`${__dirname}/users.json`, { encoding: 'utf8' })
    .then((data) => JSON.parse(data))
    .catch(async () => {
      const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
      await saveUsersFile(users)
      return users
    })
}

server.get('/api/v1/users', async (req, res) => {
  const users = await readUsersFile()
  res.json(users)
}) // Read

server.post('/api/v1/users', async (req, res) => {
  // Получаем нового пользователя
  const newUser = req.body
  // Получаем массив из файла users.json функцией readFile()
  let users = await readUsersFile()
  // Находим максимальный id и присваиваем новому пользователю следующий id
  let maxId = 0
  users.map((rec) => {
    if (maxId < rec.id) maxId = rec.id
    return maxId
  })
  newUser.id = maxId + 1
  // Добавляем элемент в массив с помощью оператора spread или функции concat()
  users = [...users, newUser]
  // Сохраняем файл функцией saveFile(), передав новый массив
  saveUsersFile(users)
  // Возврадаем статус
  res.json({ status: 'SUCCESS', id: newUser.id })
}) // Read/Write

// server.patch('/api/v1/users/:userId', async (req, res) => {
//   // Получаем нового пользователя
//   const newData = req.body
//   // Получаем ID пользователя
//   const { userId } = req.params
//   // Получаем массив из файла users.json функцией readFile()
//   const users = await readUsersFile()
//   // Методом map() или reduce() перебираем элементы массива.
//   // Если ID элемента соответствует полученному ID - обновляем элемент,
//   // в противном случае оставляем исходный элемент.
//   // Для проверки элемента можно воспользоваться условием:
//   // rec.id === +userId
//   users.map((rec) => {
//     if (rec.id === +userId) {
//       Object.keys(newData).map((field) => {
//         // eslint-disable-next-line no-param-reassign
//         rec[field] = newData[field]
//         return rec
//       })
//     }
//     return users
//   })
//   // Сохраняем файл функцией saveFile(), передав новый массив
//   saveUsersFile(users)
//   // Возврадаем статус
//   res.json({ status: 'SUCCESS', id: userId })
// }) // Read/Write

server.patch('/api/v1/users/:userId', async (req, res) => {
  // Получаем нового пользователя
  const newData = req.body
  // Получаем ID пользователя
  const { userId } = req.params
  // Получаем массив из файла users.json функцией readFile()
  const users = await readUsersFile()
  // Методом map() или reduce() перебираем элементы массива.
  // Если ID элемента соответствует полученному ID - обновляем элемент,
  // в противном случае оставляем исходный элемент.
  // Для проверки элемента можно воспользоваться условием:
  // rec.id === +userId

  // users.map((rec) => {
  //   if (rec.id === +userId) {
  //     Object.keys(newData).map((field) => {
  //       // eslint-disable-next-line no-param-reassign
  //       rec[field] = newData[field]
  //       return rec
  //     })
  //   }
  //   return users
  // })

  for (let i = 0; i < users.length; i += 1) {
    if (users[i].id === +userId) {
      users[i] = { ...users[i], ...newData }
    }
  }

  // Сохраняем файл функцией saveFile(), передав новый массив
  saveUsersFile(users)
  // Возврадаем статус
  res.json({ status: 'SUCCESS', id: userId })
}) // Read/Write

server.delete('/api/v1/users/:userId', async (req, res) => {
  // Получаем ID пользователя
  const { userId } = req.params
  // Получаем массив из файла users.json функцией readFile()
  let users = await readUsersFile()
  // Удаляем элемент из массива с помощью метода filter()
  users = users.filter((rec) => rec.id !== +userId)
  // Сохраняем файл функцией saveFile(), передав новый массив
  saveUsersFile(users)
  // Возврадаем статус
  res.json({ status: 'SUCCESS', id: userId })
}) // Read/Write

server.delete('/api/v1/users', async (req, res) => {
  await unlink(`${__dirname}/users.json`)
  res.json({ status: 'SUCCESS' })
}) // Write

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
