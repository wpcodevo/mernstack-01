const uuid = () => {
  const head = new Date().getTime().toString(32);
  const tail = Math.random().toString(32).substring(2);
  return head + tail;
};

export default uuid;
