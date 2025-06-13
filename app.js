    const express = require('express');
    const bodyParser = require('body-parser');
    const { graphqlHTTP } = require('express-graphql');
    const { buildSchema } = require('graphql');
    const mongoose = require('mongoose');
    const Event = require('./models/event'); 
    const app = express();

    const events = [];

    app.use(bodyParser.json());

    app.use('/graphql', graphqlHTTP({
        schema: buildSchema(`
            type Event{
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }`),
        rootValue: {
            events: () => {
              return Event.find().then(events => {
                    return events.map(event => {
                        return {...event._doc};
                    });
                }).catch(err => {
                    console.error('Error fetching events:', err);
                    throw err;
                });
            },
            createEvent: (args) => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });
                return event.save().then(result => {
                    console.log('Event created:', result);
                    return {...result._doc};
                }).catch(err => {
                    console.error('Error saving event:', err);
                    throw err;
                });
              
            }
        },
        graphiql: true
    }))
   
    mongoose.connect('mongodb://127.0.0.1:27017/node-graphql', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    }).then(() => {
        app.listen(3000);
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
    mongoose.Promise = global.Promise;