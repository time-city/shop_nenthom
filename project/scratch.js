const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9\s]/g, "").trim();
};

const displayName = "Jade Private Fitness, 46, Đường Nại Nam, Phường Hòa Cường, Thành phố Đà Nẵng, 50507, Việt Nam";

const rawParts = displayName.split(',');
const nameParts = rawParts
  .map(s => removeDiacritics(s))
  .filter(s => s.length > 3);

console.log("nameParts:", nameParts);

const normName = removeDiacritics("Hòa Cường Bắc");
const normFull = removeDiacritics("Phường Hòa Cường Bắc");

for (const part of nameParts) {
    if (part.length > 6 && (normName.includes(part) || normFull.includes(part))) {
        console.log(`MATCHED PART: ${part}`);
    }
}
