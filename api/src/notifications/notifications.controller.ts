import { Controller , Get , Post , Delete , Body , Param , Patch , ParseIntPipe} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { NotificationsService } from './notifications.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';


@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    findAll(@Session() session: UserSession) {
        return this.notificationsService.findAll(session.user.email);
    }

    @Get('unread-count')
    unreadCount(@Session() session: UserSession) {
        return this.notificationsService.unreadCount(session.user.email);
    }

    @Get('settings')
    readSettings(@Session() session: UserSession){
        return this.notificationsService.readSettings(session.user.email);
    }
    
    @Patch('settings')
    updateSettings(@Body() dto: UpdateSettingsDto, @Session() session: UserSession) {
        return this.notificationsService.updateSettings(dto, session.user.email);
    }

    @Patch('read-all')
    markAllRead(@Session() session: UserSession) {
        return this.notificationsService.markAllRead(session.user.email);
    }

    @Patch(':id/read')
    markRead(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
        return this.notificationsService.setRead(id, true, session.user.email);
    }

    @Patch(':id/unread')
    markUnread(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
        return this.notificationsService.setRead(id, false, session.user.email);
    }

    @Delete()
    clearAll(@Session() session: UserSession) {
        return this.notificationsService.clearAll(session.user.email);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Session() session: UserSession) {
        return this.notificationsService.remove(id, session.user.email);
    }



}