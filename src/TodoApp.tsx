import { boolean, number, string, TypeOf } from 'io-ts'
import React from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { Switch } from 'react-router'
import {
  component,
  formSubmit,
  Post,
  Put,
  rest,
  Router,
  RowClickEvent,
  SafeRoute as Route,
  Section,
  SimpleAsync,
  SimpleEditor,
  SimpleTable,
  Title,
  useMatch,
  useRouter,
} from 'technoidentity-devfractal'
import { fn, props, req } from 'technoidentity-utils'

const Todo = req({ id: number, title: string, completed: boolean })

type Todo = TypeOf<typeof Todo>

const todoApi = rest({
  baseURL: 'https://jsonplaceholder.typicode.com',
  resource: 'todos',
  type: Todo,
})

const initialValues: Todo = {
  id: 100,
  title: '',
  completed: false,
}

export const TodoFormProps = props(
  { initial: Todo },
  { onSubmit: fn<(values: Todo) => Promise<void>>() },
)
type TodoFormProps = TypeOf<typeof TodoFormProps>

const TodoForm = component(TodoFormProps, ({ onSubmit, initial }) => (
  <SimpleEditor
    id="id"
    data={initial || initialValues}
    onSubmit={formSubmit(onSubmit)}
  />
))

const CreateTodoRoute = () => (
  <>
    <Title textAlignment="centered">Create Todo</Title>
    <Post component={TodoForm} onPost={todoApi.create} redirectURL={'/'} />
  </>
)

const Params = req({ id: string })

export const EditTodoRoute = () => {
  const { params } = useMatch<TypeOf<typeof Params>>()

  return (
    <Put<Todo>
      id={params.id}
      doGet={todoApi.get}
      onPut={todoApi.update}
      component={TodoForm}
      redirectURL="/"
    />
  )
}

interface TodoListViewProps {
  readonly todoList: ReadonlyArray<Todo>
  onEdit(evt: RowClickEvent<Todo>): void
}

export const TodoListView: React.FC<TodoListViewProps> = ({
  todoList,
  onEdit,
}) => (
  <SimpleTable
    data={todoList}
    headers={['id', 'title', 'completed']}
    onRowClicked={onEdit}
  />
)

export const TodoListRoute = () => {
  const { history } = useRouter()

  return (
    <>
      <Title textAlignment="centered">Todo List</Title>
      <SimpleAsync asyncFn={todoApi.many}>
        {({ data }) => (
          <TodoListView
            todoList={data}
            onEdit={evt => history.push(`/todos/${evt.value.id}/edit`)}
          />
        )}
      </SimpleAsync>
    </>
  )
}

export const TodoApp = () => (
  <Section>
    <Router variant="browser">
      <Switch>
        <Route exact path="/" component={TodoListRoute} />
        <Route exact path="/todos/add" component={CreateTodoRoute} />
        <Route exact path="/todos/:id/edit" component={EditTodoRoute} />
      </Switch>
    </Router>
  </Section>
)
