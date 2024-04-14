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

  app.use(express.static('dist'))
  app.use(express.json())
  app.use(requestLogger)
  app.use(cors())

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  }) 
  
  app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
  })

  app.get('/api/notes/', (request, response) => {
    console.log(Note)
    Note.find({}).then(notes => {
        response.json(notes)
    })
  })

  app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
  })

  const generateId = () => {
    const maxId = notes.length > 0
    ? Math.max(...notes.map(n=> n.id))
    : 0

    return maxId+1
  }
  app.post('/api/notes', (request, response, next) => {
    const body = request.body

    const note = new Note ({
        content: body.content,
        important: body.import || false, // have to do convert to bool bc it's a string
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    })
    .catch(error => next(error))
  })

  app.put('/api/notes/:id', (request, response, next) => {
    const {content, important} = request.body
  
    Note.findByIdAndUpdate(request.params.id,
      {content, important},
      { new: true, runValidators: true, context: 'query' })
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })
  
  app.use(unknownEndpoint) // how to put the middleware to use

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({error: error.message})
    }
  
    next(error)
  }
  
  // this has to be the last loaded middleware, also all the routes should be registered before this!
  app.use(errorHandler)

  const PORT = process.env.PORT || process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })