import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import PlayIcon from '@material-ui/icons/PlayArrow'
import MoreIcon from '@material-ui/icons/MoreVert'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Mutation } from 'react-apollo'
import { DELETE_TODO } from './mutations/deleteTodo'

const GET_TODOS = gql`
  query {
    getAllTodos {
      id
      text
      complete
      createdAt
    }
  }
`

const ADD_TODO = gql`
  mutation($text: String) {
    createTodo(text: $text) {
      id
      text
      complete
      createdAt
    }
  }
`

const TOGGLE_COMPLETE = gql`
  mutation($todoId: ID, $complete: Boolean) {
    toggleComplete(todoId: $todoId, complete: $complete) {
      id
      text
      complete
      createdAt
    }
  }
`

const styles = theme => ({
  root: {
    height: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '50vw',
    height: '75vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '75%'
  },
  list: {
    height: '50vh',
    width: '40vw',
    overflowY: 'auto',
    border: '1px solid grey'
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2
  },
  dialog: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  dialogContent: {
    width: '35vw'
  }
})

class Root extends Component {
  state = {
    open: false,
    text: '',
    anchorEl: null,
    voice: null
  }

  async componentDidMount() {
    this.speaker = new SpeechSynthesisUtterance()
    this.speaker.lang = 'en-US'
  }

  handleSpeech = todos => {
    var phrase = '       Your To Do List.         '
    todos.forEach(t => {
      phrase = phrase.concat(t.text, ',          ')
    })
    phrase = phrase.concat('.   Add that is all folks.   Thank You.  ')
    this.speaker.text = phrase
    if (this.state.voice) {
      this.speaker.voice = this.state.voice
    }
    speechSynthesis.speak(this.speaker)
  }

  handleMenu = e => this.setState({ anchorEl: e.currentTarget })

  handleMenuClose = () => this.setState({ anchorEl: null })

  handleVoice = voice => this.setState({ voice, anchorEl: null })

  onClose = () => this.setState({ open: false, text: '' })

  handleFab = () => this.setState({ open: true })

  handleChange = e => this.setState({ text: e.target.value })

  render() {
    const { classes } = this.props
    return [
      <div className={classes.root} key="main">
        <Query query={GET_TODOS}>
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`

            return (
              <Card className={classes.card} raised>
                <CardHeader
                  className={classes.cardHeader}
                  title={<Typography variant="display3">Todo List</Typography>}
                  action={[
                    <IconButton
                      key="speech"
                      onClick={() => this.handleSpeech(data.getAllTodos)}
                    >
                      <PlayIcon />
                    </IconButton>,
                    <IconButton key="options" onClick={this.handleMenu}>
                      <MoreIcon />
                    </IconButton>
                  ]}
                />
                <CardContent>
                  <List className={classes.list}>
                    {data.getAllTodos.map((todo, i) => (
                      <ListItem key={todo.id} dense>
                        <Mutation mutation={TOGGLE_COMPLETE}>
                          {(toggleComplete, { loading, error }) => (
                            <Checkbox
                              checked={todo.complete}
                              indeterminate={error}
                              tabIndex={-1}
                              onChange={(event, checked) =>
                                toggleComplete({
                                  variables: {
                                    todoId: todo.id,
                                    complete: checked
                                  }
                                })
                              }
                            />
                          )}
                        </Mutation>
                        <ListItemText
                          primary={todo.text}
                          secondary={
                            todo.complete ? 'Completed' : 'Not Completed'
                          }
                        />
                        <Mutation
                          mutation={DELETE_TODO}
                          refetchQueries={[{ query: GET_TODOS }]}
                        >
                          {(deleteTodo, { loading, error }) => (
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() =>
                                  deleteTodo({
                                    variables: { todoId: todo.id }
                                  })
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </Mutation>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )
          }}
        </Query>
        <Button
          variant="fab"
          className={classes.fab}
          color="primary"
          onClick={this.handleFab}
        >
          <AddIcon />
        </Button>
      </div>,
      <Mutation
        mutation={ADD_TODO}
        key="dialog"
        update={(cache, { data: { createTodo } }) => {
          const { getAllTodos } = cache.readQuery({ query: GET_TODOS })
          cache.writeQuery({
            query: GET_TODOS,
            data: { getAllTodos: [createTodo, ...getAllTodos] }
          })
        }}
      >
        {(createTodo, { loading, error }) => (
          <Dialog
            open={this.state.open}
            onClose={this.onClose}
            className={classes.dialog}
          >
            <DialogTitle>Create New Todo</DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <TextField
                onChange={this.handleChange}
                value={this.state.text}
                placeholder="Enter Todo Text..."
                label={error ? 'Error Creating Todo' : 'Todo Text'}
                fullWidth
                error={error}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant="raised"
                color="primary"
                disabled={!this.state.text}
                onClick={() => {
                  createTodo({
                    variables: { text: this.state.text }
                  })
                  this.onClose()
                }}
              >
                Save
              </Button>

              <Button variant="raised" onClick={this.onClose}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Mutation>,
      <Menu
        key="menu"
        open={Boolean(this.state.anchorEl)}
        onClose={this.handleMenuClose}
        anchorEl={this.state.anchorEl}
      >
        {speechSynthesis.getVoices().map((v, i) => (
          <MenuItem key={i} onClick={() => this.handleVoice(v)}>
            {v.name}
          </MenuItem>
        ))}
      </Menu>
    ]
  }
}

export default withStyles(styles)(Root)
