import React from 'react'
import ReactDOM from 'react-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import Root from './Root'
import 'typeface-roboto'

const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql'
})

const root = document.getElementById('root')

ReactDOM.render(
  <ApolloProvider client={client}>
    <Root />
  </ApolloProvider>,
  root
)
