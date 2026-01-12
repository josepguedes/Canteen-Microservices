export const validateMenuDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

export const validateMenuPeriod = (period: string): boolean => {
  const validPeriods = ['breakfast', 'lunch', 'dinner'];
  return validPeriods.includes(period.toLowerCase());
};

export const validateDishCategory = (category: string): boolean => {
  const validCategories = ['starter', 'main', 'dessert', 'drink', 'side'];
  return validCategories.includes(category.toLowerCase());
};

export const isValidId = (id: any): boolean => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};
