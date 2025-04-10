export function upsertBy<T>(array: T[], keyGetter: (item: T) => string, valueToUpsert: T) {
  const newArray: T[] = [];
  let found = false;
  for (const value of array) {
    if (keyGetter(value) === keyGetter(valueToUpsert)) {
      newArray.push(valueToUpsert);
      found = true;
    } else {
      newArray.push(value);
    }
  }

  if (!found) {
    newArray.push(valueToUpsert);
  }

  return newArray;
}
