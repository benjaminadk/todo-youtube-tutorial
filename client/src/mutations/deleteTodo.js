import gql from 'graphql-tag'

export const DELETE_TODO = gql`
  mutation($todoId: ID) {
    deleteTodo(todoId: $todoId) {
      success
      message
    }
  }
`
