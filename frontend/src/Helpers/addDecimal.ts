const addDecimal = (num: number) => {
  const newNum = parseFloat(`${num}`).toFixed(2);
  return newNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default addDecimal;
