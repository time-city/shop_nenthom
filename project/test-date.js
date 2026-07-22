const now = new Date();
const start = new Date(now);
start.setHours(0, 0, 0, 0);

console.log("System TZ offset:", now.getTimezoneOffset());
console.log("now:", now.toISOString());
console.log("start:", start.toISOString());
