const _dayOfWeek = (week: number | string, locale: string = 'en-US') => {
  if (typeof week === 'string') {
    week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].findIndex((w) =>
      w.includes(week.toString().toLowerCase())
    );
  }

  if (![...Array(7)].map((_, i) => i).includes(week)) {
    return null;
  }

  const currentDate = new Date();

  const offset = week - currentDate.getDay();

  const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + offset);

  const localeOption: Intl.DateTimeFormatOptions = {
    weekday: 'short',
  };

  return newDate.toLocaleDateString(locale, localeOption);
};

export namespace Time {
  export const dayOfWeek = _dayOfWeek;
}
