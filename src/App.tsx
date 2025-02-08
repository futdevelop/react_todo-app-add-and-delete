import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { addTodo, deleteTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import Footer from './components/Footer';
import Header from './components/Header';
import ErrorMessage from './components/ErrorMessage';
import TodoList from './components/TodoList';

export const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [disabledTitle, setDisabledTitle] = useState(false);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>();
  const [processings, setProcessings] = useState<number[]>([]);

  let completedTodos = todos.filter((todo: Todo) => todo.completed);

  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const inputRef = useRef<HTMLInputElement>(null);

  function getVisibleTodos() {
    return todos.filter(todo => {
      switch (selectedFilter) {
        case 'completed':
          return todo.completed;
        case 'active':
          return !todo.completed;
        case 'all':
        default:
          return true;
      }
    });
  }

  const visibleTodos = getVisibleTodos();

  useEffect(() => {
    getVisibleTodos();
  }, [selectedFilter]);
  const handleError = (error: string) => {
    setErrorMessage(error);

    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const fetchTodos = () => {
    getTodos()
      .then((res: Todo[]) => setTodos(res))
      .catch(() => handleError('Unable to load todos'));
  };

  useEffect(() => fetchTodos(), []);

  const handleSelectedFilter = (filter: string) => setSelectedFilter(filter);

  const handleTitleChange = (ch: string) => setTitle(ch);

  const deleteErrorMessage = () => setErrorMessage('');

  const itemsLeft = todos.length - completedTodos.length;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    setDisabledTitle(true);

    if (!title) {
      setTitle(prevTitle => prevTitle.trim());
      handleError('Title should not be empty');
      setTimeout(() => inputRef.current?.focus(), 0);

      setDisabledTitle(false);

      return;
    }

    setTempTodo({
      title,
      id: Math.random(),
      completed: false,
      userId: USER_ID,
    });

    addTodo({ title, completed: false })
      .then(data => {
        setTodos(prevTodos => [...prevTodos, { ...data }]);
        setTitle('');
      })
      .catch(() => handleError('Unable to add a todo'))
      .finally(() => {
        setDisabledTitle(false);
        setTempTodo(null);
        setTimeout(() => inputRef.current?.focus(), 0);
      });
  };

  const handleDeleteTodo = (todoId: number) => {
    setProcessings((prevProcessings: number[]) => [...prevProcessings, todoId]);

    deleteTodo(todoId)
      .then(() => {
        fetchTodos();
      })
      .catch(() => handleError('Unable to delete a todo'));
  };

  const clearCompletedTodos = () => {
    completedTodos.map((completedTodo: Todo) =>
      handleDeleteTodo(completedTodo.id),
    );
    completedTodos = [];
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          handleSubmit={handleSubmit}
          inputRef={inputRef}
          disabledTitle={disabledTitle}
          title={title}
          handleTitleChange={handleTitleChange}
        />

        <TodoList
          processings={processings}
          visibleTodos={visibleTodos}
          handleDeleteTodo={handleDeleteTodo}
          tempTodo={tempTodo}
        />

        {todos.length > 0 && (
          <Footer
            completedTodos={completedTodos}
            itemsLeft={itemsLeft}
            selectedFilter={selectedFilter}
            handleSelectedFilter={handleSelectedFilter}
            clearCompletedTodos={clearCompletedTodos}
          />
        )}
      </div>
      <ErrorMessage
        errorMessage={errorMessage}
        deleteErrorMessage={deleteErrorMessage}
      />
    </div>
  );
};
