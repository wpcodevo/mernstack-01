import React, { useCallback, useEffect, useState } from 'react';

const functions = new Set();

const TestingPage = () => {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState([]);

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  const decrement = () => {
    setCount((prev) => prev + 1);
  };

  const myConsole = useCallback(() => console.log(functions), []);

  functions.add(myConsole);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.json())
      .then((users) => {
        setUsers(users);
      });
  }, []);

  return (
    <div>
      <h1>{count}</h1>
      <p>{JSON.stringify(users)}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

export default TestingPage;
