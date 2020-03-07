export function assert(condition: boolean, msg: string): asserts condition {
  if (!condition) {
    throw new Error('INTERNAL ASSERTION FAILURE: ' + msg);
  }
}

/**
 * Formats a Date as a YYYY-MM-DD string, suitable for use with <input
 * type="date"> control.
 */
export function formatDate(date: Date) {
  const year = date.getFullYear();
  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

type Scalar = number|string;

export function scalarArrayEquals(array1: Scalar[], array2: Scalar[]) {
  if (array1.length !== array2.length) {
    return false;
  }

  for(let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}