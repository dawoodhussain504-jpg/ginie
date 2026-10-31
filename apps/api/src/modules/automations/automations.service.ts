import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { CreateWorkflowDto, WorkflowTriggerEventType } from '@ginie/common';

@Injectable()
export class AutomationsService {
  async listWorkflows(tenantId: string) {
    const workflows = await prisma.workflow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        runs: {
          take: 1,
          orderBy: { executedAt: 'desc' },
        },
      },
    });
    return workflows;
  }

  async getWorkflow(tenantId: string, id: string) {
    const workflow = await prisma.workflow.findFirst({
      where: { id, tenantId },
      include: {
        runs: {
          take: 10,
          orderBy: { executedAt: 'desc' },
        },
      },
    });
    if (!workflow) {
      throw new NotFoundException('Automated action not found.');
    }
    return workflow;
  }

  async createWorkflow(tenantId: string, dto: CreateWorkflowDto) {
    return prisma.workflow.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        triggerEvent: dto.triggerEvent,
        conditions: dto.conditions as any,
        actions: dto.actions as any,
        isActive: dto.isActive,
      },
    });
  }

  async updateWorkflow(tenantId: string, id: string, dto: Partial<CreateWorkflowDto>) {
    await this.getWorkflow(tenantId, id);
    return prisma.workflow.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        triggerEvent: dto.triggerEvent,
        conditions: dto.conditions as any,
        actions: dto.actions as any,
        isActive: dto.isActive,
      },
    });
  }

  async deleteWorkflow(tenantId: string, id: string) {
    await this.getWorkflow(tenantId, id);
    return prisma.workflow.delete({ where: { id } });
  }

  async listRuns(tenantId: string, limit = 20) {
    return prisma.workflowRun.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { executedAt: 'desc' },
      include: {
        workflow: {
          select: { name: true, triggerEvent: true },
        },
      },
    });
  }

  /**
   * Evaluates conditions and executes actions for a trigger event
   */
  async triggerWorkflows(
    tenantId: string,
    event: WorkflowTriggerEventType,
    entityData: Record<string, any>,
    entityId?: string,
  ) {
    const activeWorkflows = await prisma.workflow.findMany({
      where: {
        tenantId,
        triggerEvent: event,
        isActive: true,
      },
    });

    const executionResults = [];

    for (const workflow of activeWorkflows) {
      const conditions = (workflow.conditions as any[]) || [];
      const actions = (workflow.actions as any[]) || [];

      // Check conditions
      let matches = true;
      for (const cond of conditions) {
        const val = entityData[cond.field];
        switch (cond.operator) {
          case 'equals':
            if (val !== cond.value) matches = false;
            break;
          case 'not_equals':
            if (val === cond.value) matches = false;
            break;
          case 'contains':
            if (!String(val || '').toLowerCase().includes(String(cond.value || '').toLowerCase())) matches = false;
            break;
          case 'greater_than':
            if (Number(val) <= Number(cond.value)) matches = false;
            break;
          case 'less_than':
            if (Number(val) >= Number(cond.value)) matches = false;
            break;
        }
        if (!matches) break;
      }

      if (!matches) continue;

      // Execute actions
      const executed = [];
      let runStatus = 'success';
      let errorMsg: string | null = null;

      try {
        for (const action of actions) {
          if (action.type === 'create_task') {
            await prisma.task.create({
              data: {
                tenantId,
                title: action.params?.title || 'Auto follow-up task',
                dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
                entityType: 'lead',
                entityId: entityId || null,
                priority: action.params?.priority || 'medium',
                status: 'pending',
              },
            });
            executed.push({ action: 'create_task', status: 'done' });
          } else if (action.type === 'assign_owner' && action.params?.userId) {
            if (entityId) {
              await prisma.lead.updateMany({
                where: { id: entityId, tenantId },
                data: { ownerId: action.params.userId },
              });
            }
            executed.push({ action: 'assign_owner', status: 'done' });
          } else if (action.type === 'webhook' && action.params?.url) {
            // Emulate outbound webhook call
            executed.push({ action: 'webhook', url: action.params.url, status: 'dispatched' });
          } else if (action.type === 'send_whatsapp') {
            // Record auto-reply WhatsApp message
            if (entityData.phone) {
              await prisma.whatsAppMessage.create({
                data: {
                  tenantId,
                  phone: entityData.phone,
                  direction: 'outbound',
                  body: action.params?.message || 'Hello! Thank you for contacting us. We will get back to you shortly.',
                  status: 'scheduled',
                  delayMs: 15000,
                },
              });
              executed.push({ action: 'send_whatsapp', phone: entityData.phone, status: 'scheduled' });
            }
          }
        }
      } catch (err: any) {
        runStatus = 'failed';
        errorMsg = err.message || 'Execution error';
      }

      const runRecord = await prisma.workflowRun.create({
        data: {
          tenantId,
          workflowId: workflow.id,
          entityId: entityId || null,
          status: runStatus,
          result: {
            executedActions: executed,
            error: errorMsg,
          },
        },
      });

      executionResults.push(runRecord);
    }

    return executionResults;
  }

  async testWorkflow(tenantId: string, id: string) {
    const workflow = await this.getWorkflow(tenantId, id);
    const samplePayload = {
      name: 'Sample Contact',
      phone: '+91 9820000000',
      status: 'New',
      source: 'Website',
      city: 'Mumbai',
    };

    return {
      message: 'Dry run completed successfully',
      workflowName: workflow.name,
      trigger: workflow.triggerEvent,
      samplePayload,
      actionsPlanned: workflow.actions,
      status: 'ready',
    };
  }
}
