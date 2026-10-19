import { Injectable  , ForbiddenException , NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

export type NotificationType =
    | 'new_order'
    | 'order_cancelled'
    | 'order_status'
    | 'sell_request'
    | 'low_stock'
    | 'out_of_stock'
    | 'new_customer'
    | 'payment'
    | 'inquiry';
    
const TYPE_TO_SETTING: Record<NotificationType, keyof UpdateSettingsDto> = {
    new_order: 'newOrders',
    order_cancelled: 'newOrders',
    order_status: 'newOrders',
    sell_request: 'sellRequests',
    low_stock: 'lowStock',
    out_of_stock: 'lowStock',
    new_customer: 'newCustomers',
    payment: 'payments',
    inquiry: 'customerInquiries',
};

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma : PrismaService ) {}

        private checkOwner ( userEmail : string ) {
            if (userEmail !== process.env.OWNER_EMAIL ) {
                throw new ForbiddenException("Only the site owner can manage notifications");
        }
    }

    getSettings() {
        return this.prisma.notificationSettings.upsert({
            where: { id: 1 },
            update: {},
            create: { id : 1},
        });
    } 

    async notify (type : NotificationType , title : string , message : string , link?:string ) {
        try {
            const settings = await this.getSettings();
            const typeEnabled = settings[TYPE_TO_SETTING[type] as keyof typeof settings];
            if (!settings.enabled || !settings.inApp || !typeEnabled) 
                return ;
                await this.prisma.notification.create({
            data: {type , title , message , link},
            }
        ); 
            }catch (err){
            console.log ("Failed to create notifications" , err)
        }
    } 

    async stockAlert(
    product: { id: number; name: string; lowStockThreshold: number | null },
    previousQty: number,
    newQty: number,
) {
    if (newQty === 0 && previousQty > 0) {
        await this.notify(
            "out_of_stock",
            `${product.name} is out of stock`,
            "No units left. Restock to keep selling it.",
            "/Inventory",
        );
        return;
    }

    const settings = await this.getSettings();
    const threshold = product.lowStockThreshold ?? settings.defaultLowStock;

    if (newQty > 0 && newQty <= threshold && previousQty > threshold) {
        await this.notify(
            "low_stock",
            `${product.name} is running low`,
            `Only ${newQty} ${newQty === 1 ? "unit" : "units"} left (threshold: ${threshold}).`,
            "/Inventory",
        );
    }
}

    findAll(userEmail: string) {
    this.checkOwner(userEmail);
    return this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
    });
    }

    async unreadCount(userEmail: string) {
    this.checkOwner(userEmail);
    const count = await this.prisma.notification.count({ where: { isRead: false } });
    return { count };
    }

    async setRead(id: number, isRead: boolean, userEmail: string) {
    this.checkOwner(userEmail);
    const exists = await this.prisma.notification.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { isRead } });
    }

    async markAllRead(userEmail: string) {
    this.checkOwner(userEmail);
    const result = await this.prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
    });
    return { updated: result.count };
    }

    async remove(id: number, userEmail: string) {
    this.checkOwner(userEmail);
    const exists = await this.prisma.notification.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Notification not found');
    await this.prisma.notification.delete({ where: { id } });
    return { deleted: 1 };
    }

    async clearAll(userEmail: string) {
    this.checkOwner(userEmail);
    const result = await this.prisma.notification.deleteMany({});
    return { deleted: result.count };
    }

    async readSettings(userEmail: string) {
    this.checkOwner(userEmail);
    return this.getSettings();
    }

    async updateSettings(dto: UpdateSettingsDto, userEmail: string) {
    this.checkOwner(userEmail);
    return this.prisma.notificationSettings.upsert({
        where: { id: 1 },
        update: dto,
        create: { id: 1, ...dto },
    });
    }
}
