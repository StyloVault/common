export const amountToKobo = (amount: number) =>{
    return amount * 100;
}

export const isPositiveInteger = (value)=> {
    const parsedValue = parseInt(value);
    return Number.isInteger(parsedValue) && parsedValue > 0;
}
  