export const isIncludedRole = (a: string[], b: string[]): boolean => {
  return [...getCrossItems(a, b), ...getCrossItems(b, a)].length > 0;
};

function getCrossItems<Role>(a: Role[], b: Role[]): Role[] {
  return a.filter((element) => {
    return b.includes(element);
  });
}

// capitalize fist letter of a string
export const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
