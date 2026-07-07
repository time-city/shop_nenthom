const fs = require('fs');

const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9\s]/g, "").trim();
};

const testCases = [
    {
        name: "Hồ Chí Minh - Quận 1 - Bến Nghé",
        displayName: "Sài Gòn Centre, 65, Đường Lê Lợi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, 700000, Việt Nam"
    },
    {
        name: "Hà Nội - Hoàn Kiếm - Tràng Tiền",
        displayName: "Nhà hát Lớn Hà Nội, 1, Phố Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Thành phố Hà Nội, 11000, Việt Nam"
    },
    {
        name: "Hà Nội - Cầu Giấy - Dịch Vọng (Missing District, testing fallback)",
        displayName: "Công viên Cầu Giấy, Phố Trương Công Giai, Phường Dịch Vọng, Thành phố Hà Nội, 122000, Việt Nam"
    },
    {
        name: "Bà Rịa - Vũng Tàu - Vũng Tàu - Phường 1",
        displayName: "Bãi Trước, Đường Quang Trung, Phường 1, Thành phố Vũng Tàu, Tỉnh Bà Rịa - Vũng Tàu, Việt Nam"
    },
    {
        name: "Thừa Thiên Huế - Huế - Vỹ Dạ",
        displayName: "Cồn Hến, Phường Vỹ Dạ, Thành phố Huế, Tỉnh Thừa Thiên Huế, Việt Nam"
    },
    {
        name: "Thành phố Thủ Đức - Linh Trung (New city inside city)",
        displayName: "Đại học Quốc gia TP.HCM, Phường Linh Trung, Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam"
    }
];

async function runTests() {
    console.log("Fetching provinces...");
    const provRes = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
    const provData = await provRes.json();
    const provinces = provData.data;

    for (const test of testCases) {
        console.log(`\n========================================`);
        console.log(`🧪 TESTING: ${test.name}`);
        console.log(`📝 INPUT: ${test.displayName}`);
        
        const displayNameNorm = removeDiacritics(test.displayName);
        const nameParts = test.displayName.split(',').map(s => removeDiacritics(s.trim())).filter(s => s.length > 3);
        
        const checkMatch = (loc) => {
            const normName = removeDiacritics(loc.name);
            const normFull = removeDiacritics(loc.full_name);
            if (displayNameNorm.includes(normName) || displayNameNorm.includes(normFull)) return true;
            for (const part of nameParts) {
                if (part.length > 6 && (normName.includes(part) || normFull.includes(part))) {
                    return true;
                }
            }
            return false;
        };

        const matchedProv = provinces.find(checkMatch);
        if (!matchedProv) {
            console.log("❌ FAILED: Province not found");
            continue;
        }
        console.log(`✅ MATCHED PROVINCE: ${matchedProv.full_name}`);

        const distRes = await fetch(`https://esgoo.net/api-tinhthanh/2/${matchedProv.id}.htm`);
        const distData = await distRes.json();
        const districts = distData.data;

        let matchedDist = districts.find(checkMatch);
        if (matchedDist) {
            console.log(`✅ MATCHED DISTRICT: ${matchedDist.full_name}`);
            const wardRes = await fetch(`https://esgoo.net/api-tinhthanh/3/${matchedDist.id}.htm`);
            const wardData = await wardRes.json();
            const matchedWard = wardData.data.find(checkMatch);
            if (matchedWard) {
                console.log(`✅ MATCHED WARD: ${matchedWard.full_name}`);
            } else {
                console.log(`❌ FAILED: Ward not found in ${matchedDist.full_name}`);
            }
        } else {
            console.log(`⚠️ DISTRICT NOT FOUND. TRIGGERING FALLBACK...`);
            let foundDist = null;
            let foundWard = null;
            
            for (const d of districts) {
                const wardRes = await fetch(`https://esgoo.net/api-tinhthanh/3/${d.id}.htm`);
                const wardData = await wardRes.json();
                const match = wardData.data.find(checkMatch);
                if (match) {
                    foundWard = match;
                    foundDist = d;
                    break;
                }
            }
            
            if (foundDist && foundWard) {
                console.log(`✅ FALLBACK SUCCESS: District: ${foundDist.full_name}, Ward: ${foundWard.full_name}`);
            } else {
                console.log(`❌ FALLBACK FAILED: District and Ward not found`);
            }
        }
    }
}

runTests();
