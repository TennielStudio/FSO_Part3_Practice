require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

  const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

  const cors = require('cors')

  app.use(express.json())
  app.use(requestLogger)
  app.use(cors())
  app.use(express.static('dist'))

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  }) 
  
  app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)

    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
  })

  app.get('/api/notes/', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
  })

  app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
  })

  const generateId = () => {
    const maxId = notes.length > 0
    ? Math.max(...notes.map(n=> n.id))
    : 0

    return maxId+1
  }
  app.post('/api/notes', (request, response) => {
    const body = request.body
    if (body.content === undefined) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note ({
        content: body.content,
        important: body.import || false, // have to do convert to bool bc it's a string
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    })
  })
  
  app.use(unknownEndpoint) // how to put the middleware to use

  const PORT = process.env.PORT || process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })