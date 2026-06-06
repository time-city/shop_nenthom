import prisma from "../prisma"
import { DeleteOptionInput, PackagingInput, ScentInput, SizeInput, ToppingInput, UpdatePackagingInput, UpdateScentInput, UpdateSizeInput, UpdateToppingInput, UpdateWaxColorInput, WaxColorInput } from "../validations/option.schema"

export const OptionService = {
    // Tạo mùi hương mới sau khi kiểm tra tên không bị trùng.
    async createScent(data: ScentInput) {
        const existing = await prisma.scent.findFirst({
            where: { name: { equals: data.name, mode: 'insensitive' } }, // insensitive => không phân biệt hoa thường
        })
        if (existing) throw new Error('Tên mùi hương đã tồn tại');

        return prisma.scent.create({ data });
    },

    // Cập nhật mùi hương và chặn đổi sang tên đã tồn tại.
    async updateScent(id: number, data: UpdateScentInput) {
        const existing = await prisma.scent.findUnique({ where: { id } });
        if (!existing) throw new Error('Mùi hương không tồn tại');
        if (data.name) {
            const existing = await prisma.scent.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    NOT: { id },
                },
            })
            if (existing) throw new Error('Tên mùi hương đã tồn tại')
        }
        return prisma.scent.update({ where: { id }, data });
    },

    // Tạo màu sáp mới sau khi kiểm tra tên không bị trùng.
    async createWaxColor(data: WaxColorInput) {
        const existing = await prisma.waxColor.findFirst({
            where: { name: { equals: data.name, mode: 'insensitive' } },
        })
        if (existing) throw new Error('Tên màu sáp đã tồn tại')

        return prisma.waxColor.create({ data })
    },

    // Cập nhật màu sáp và chặn đổi sang tên đã tồn tại.
    async updateWaxColor(id: number, data: UpdateWaxColorInput) {
        const color = await prisma.waxColor.findUnique({ where: { id } })
        if (!color) throw new Error('Màu sáp không tồn tại')

        if (data.name) {
            const existing = await prisma.waxColor.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    NOT: { id },
                },
            })
            if (existing) throw new Error('Tên màu sáp đã tồn tại')
        }

        return prisma.waxColor.update({ where: { id }, data })
    },

    // Tạo kích thước nến mới sau khi kiểm tra tên không bị trùng.
    async createSize(data: SizeInput) {
        const existing = await prisma.candleSize.findFirst({
            where: { name: { equals: data.name, mode: 'insensitive' } },
        })
        if (existing) throw new Error('Tên kích thước đã tồn tại')

        return prisma.candleSize.create({ data })
    },

    // Cập nhật kích thước nến và chặn đổi sang tên đã tồn tại.
    async updateSize(id: number, data: UpdateSizeInput) {
        const size = await prisma.candleSize.findUnique({ where: { id } })
        if (!size) throw new Error('Kích thước không tồn tại')

        if (data.name) {
            const existing = await prisma.candleSize.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    NOT: { id },
                },
            })
            if (existing) throw new Error('Tên kích thước đã tồn tại')
        }

        return prisma.candleSize.update({ where: { id }, data })
    },

    // Tạo loại bao bì mới sau khi kiểm tra tên không bị trùng.
    async createPackaging(data: PackagingInput) {
        const existing = await prisma.packaging.findFirst({
            where: { name: { equals: data.name, mode: 'insensitive' } },
        })
        if (existing) throw new Error('Tên bao bì đã tồn tại')

        return prisma.packaging.create({ data })
    },

    // Cập nhật loại bao bì và chặn đổi sang tên đã tồn tại.
    async updatePackaging(id: number, data: UpdatePackagingInput) {
        const packaging = await prisma.packaging.findUnique({ where: { id } })
        if (!packaging) throw new Error('Bao bì không tồn tại')

        if (data.name) {
            const existing = await prisma.packaging.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    NOT: { id },
                },
            })
            if (existing) throw new Error('Tên bao bì đã tồn tại')
        }

        return prisma.packaging.update({ where: { id }, data })
    },


    // Tạo topping mới sau khi kiểm tra tên không bị trùng.
    async createTopping(data: ToppingInput) {
        const existing = await prisma.topping.findFirst({
            where: { name: { equals: data.name, mode: 'insensitive' } },
        })
        if (existing) throw new Error('Tên topping đã tồn tại')

        return prisma.topping.create({ data })
    },

    // Cập nhật topping và chặn đổi sang tên đã tồn tại.
    async updateTopping(id: number, data: UpdateToppingInput) {
        const topping = await prisma.topping.findUnique({ where: { id } })
        if (!topping) throw new Error('Topping không tồn tại')

        if (data.name) {
            const existing = await prisma.topping.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    NOT: { id },
                },
            })
            if (existing) throw new Error('Tên topping đã tồn tại')
        }

        return prisma.topping.update({ where: { id }, data })
    },

    // Ẩn option khỏi danh sách sử dụng bằng cách tắt is_active thay vì xóa cứng.
    async deleteOption(type: DeleteOptionInput['type'], id: number) {
        switch (type) {
            case 'scent':
                const scent = await prisma.scent.findUnique({ where: { id } })
                if (!scent) throw new Error('Mùi hương không tồn tại')
                return prisma.scent.update({ where: { id }, data: { is_active: false } })

            case 'waxColor':
                const color = await prisma.waxColor.findUnique({ where: { id } })
                if (!color) throw new Error('Màu sáp không tồn tại')
                return prisma.waxColor.update({ where: { id }, data: { is_active: false } })

            case 'size':
                const size = await prisma.candleSize.findUnique({ where: { id } })
                if (!size) throw new Error('Kích thước không tồn tại')
                return prisma.candleSize.update({ where: { id }, data: { is_active: false } })

            case 'packaging':
                const packaging = await prisma.packaging.findUnique({ where: { id } })
                if (!packaging) throw new Error('Bao bì không tồn tại')
                return prisma.packaging.update({ where: { id }, data: { is_active: false } })

            case 'topping':
                const topping = await prisma.topping.findUnique({ where: { id } })
                if (!topping) throw new Error('Topping không tồn tại')
                return prisma.topping.update({ where: { id }, data: { is_active: false } })
        }
    },
}
