module.exports = {
  Query: {
    getAllTodos: async (root, args, { models }) => {
      const todos = await models.Todo.find()
      return todos.reverse()
    }
  },

  Mutation: {
    createTodo: async (root, { text }, { models }) => {
      try {
        const todo = new models.Todo({ text })
        const savedTodo = await todo.save()
        return savedTodo
      } catch (error) {
        console.log('createTodo', error)
        return null
      }
    },

    toggleComplete: async (root, { todoId, complete }, { models }) => {
      const filter = { _id: todoId }
      const update = { $set: { complete } }
      await models.Todo.findOneAndUpdate(filter, update)
      return await models.Todo.findById(todoId)
    },

    deleteTodo: async (root, { todoId }, { models }) => {
      try {
        await models.Todo.findByIdAndRemove(todoId)
        return {
          success: true,
          message: 'Todo Deleted Successfully'
        }
      } catch (error) {
        console.log('deleteTodo', error)
        return {
          success: false,
          message: 'Error Deleting Todo'
        }
      }
    }
  }
}
