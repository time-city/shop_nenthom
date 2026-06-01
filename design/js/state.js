// ============================================
// ChamCham - State Management
// ============================================

const scents = {
    'Santal 33': {
        name: 'Santal 33',
        desc: 'Gỗ đàn hương, da thuộc, sang trọng',
        color: '#D4A574'
    },
    'Aquamarine': {
        name: 'Aquamarine',
        desc: 'Biển xanh, tươi mát, khoáng đạt',
        color: '#7EC8C8'
    },
    'Orchid & Sea Salt': {
        name: 'Orchid & Sea Salt',
        desc: 'Hoa lan quyến rũ, muối biển nhẹ nhàng',
        color: '#C9A0C0'
    },
    'Oakmoss Amber': {
        name: 'Oakmoss Amber',
        desc: 'Rêu rừng, hổ phách ấm, trầm sâu',
        color: '#8B7355'
    },
    'Incense Villages': {
        name: 'Incense Villages',
        desc: 'Trầm hương làng cổ, khói nhẹ, hoài niệm',
        color: '#C4956A'
    },
    'Campfire': {
        name: 'Campfire',
        desc: 'Lửa trại, gỗ cháy, khói thông',
        color: '#C4622A'
    }
};

const toppings = {
    'Socola': 15000,
    'Trái tim lớn': 20000,
    'Trái tim vừa': 15000,
    'Trái tim nhỏ': 10000,
    'Hoa hồng khô': 25000,
    'Hoa mẫu đơn khô': 25000,
    'Strawberry sấy': 20000,
    'Việt quất sấy': 20000
};

const state = {
    scent: 'Santal 33',
    scentDesc: 'Gỗ đàn hương, da thuộc, sang trọng',
    scentColor: '#D4A574',
    color: '#f5ede3',
    colorName: 'Kem',
    size: 'S — 100g',
    pack: 'Hộp trắng',
    selectedToppings: []
};

const prices = {
    'S — 100g': 189000,
    'M — 200g': 259000,
    'L — 350g': 349000
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { state, prices, scents, toppings };
}
