import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskSchema } from '@ginie/common';
import { CurrentUser, CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: string,
  ) {
    return this.tasksService.findAll(tenantId, { assigneeId, status });
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const validated = CreateTaskSchema.parse(body);
    return this.tasksService.create(tenantId, userId, validated);
  }

  @Patch(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.tasksService.update(tenantId, id, body);
  }

  @Delete(':id')
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tasksService.remove(tenantId, id);
  }
}
