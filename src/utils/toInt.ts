export const toInt = (result: any): number => {
  return result.sign === true ? -Number(result.mag) : Number(result.mag)
}
