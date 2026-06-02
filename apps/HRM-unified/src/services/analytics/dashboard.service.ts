// src/services/analytics/dashboard.service.ts
// Custom Dashboard CRUD Service

import { db } from '@/lib/db'

export interface CreateDashboardInput {
  name: string
  description?: string
  layout: Record<string, unknown>
  isDefault?: boolean
  isShared?: boolean
}

export interface UpdateDashboardInput {
  name?: string
  description?: string
  layout?: Record<string, unknown>
  isDefault?: boolean
  isShared?: boolean
}

export interface CreateWidgetInput {
  widgetType: string
  title: string
  x: number
  y: number
  width: number
  height: number
  config: Record<string, unknown>
  dataSource: Record<string, unknown>
}

export interface UpdateWidgetInput {
  widgetType?: string
  title?: string
  x?: number
  y?: number
  width?: number
  height?: number
  config?: Record<string, unknown>
  dataSource?: Record<string, unknown>
}

export async function list(tenantId: string, userId: string) {
  const dashboards = await db.dashboard.findMany({
    where: {
      tenantId,
      OR: [
        { userId },
        { isShared: true },
      ],
    },
    include: {
      widgets: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' },
    ],
  })

  return dashboards
}

export async function getById(tenantId: string, userId: string, id: string) {
  const dashboard = await db.dashboard.findFirst({
    where: {
      id,
      tenantId,
      OR: [
        { userId },
        { isShared: true },
      ],
    },
    include: {
      widgets: {
        orderBy: [{ y: 'asc' }, { x: 'asc' }],
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return dashboard
}

export async function create(
  tenantId: string,
  userId: string,
  data: CreateDashboardInput
) {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await db.dashboard.updateMany({
      where: { tenantId, userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const dashboard = await db.dashboard.create({
    data: {
      tenantId,
      userId,
      name: data.name,
      description: data.description,
      layout: data.layout as object,
      isDefault: data.isDefault || false,
      isShared: data.isShared || false,
    },
    include: {
      widgets: true,
    },
  })

  return dashboard
}

export async function update(
  tenantId: string,
  userId: string,
  id: string,
  data: UpdateDashboardInput
) {
  // Verify ownership
  const existing = await db.dashboard.findFirst({
    where: { id, tenantId, userId },
  })

  if (!existing) {
    throw new Error('Dashboard không tồn tại hoặc bạn không có quyền chỉnh sửa')
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await db.dashboard.updateMany({
      where: { tenantId, userId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    })
  }

  const dashboard = await db.dashboard.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.layout !== undefined && { layout: data.layout as object }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(data.isShared !== undefined && { isShared: data.isShared }),
    },
    include: {
      widgets: true,
    },
  })

  return dashboard
}

export async function remove(tenantId: string, userId: string, id: string) {
  // Verify ownership
  const existing = await db.dashboard.findFirst({
    where: { id, tenantId, userId },
  })

  if (!existing) {
    throw new Error('Dashboard không tồn tại hoặc bạn không có quyền xóa')
  }

  await db.dashboard.delete({
    where: { id },
  })
}

export async function addWidget(
  tenantId: string,
  userId: string,
  dashboardId: string,
  data: CreateWidgetInput
) {
  // Verify dashboard ownership
  const dashboard = await db.dashboard.findFirst({
    where: { id: dashboardId, tenantId, userId },
  })

  if (!dashboard) {
    throw new Error('Dashboard không tồn tại hoặc bạn không có quyền chỉnh sửa')
  }

  const widget = await db.dashboardWidget.create({
    data: {
      dashboardId,
      widgetType: data.widgetType,
      title: data.title,
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      config: data.config as object,
      dataSource: data.dataSource as object,
    },
  })

  return widget
}

export async function updateWidget(
  tenantId: string,
  userId: string,
  dashboardId: string,
  widgetId: string,
  data: UpdateWidgetInput
) {
  // Verify dashboard ownership
  const dashboard = await db.dashboard.findFirst({
    where: { id: dashboardId, tenantId, userId },
  })

  if (!dashboard) {
    throw new Error('Dashboard không tồn tại hoặc bạn không có quyền chỉnh sửa')
  }

  const widget = await db.dashboardWidget.update({
    where: { id: widgetId },
    data: {
      ...(data.widgetType !== undefined && { widgetType: data.widgetType }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.x !== undefined && { x: data.x }),
      ...(data.y !== undefined && { y: data.y }),
      ...(data.width !== undefined && { width: data.width }),
      ...(data.height !== undefined && { height: data.height }),
      ...(data.config !== undefined && { config: data.config as object }),
      ...(data.dataSource !== undefined && { dataSource: data.dataSource as object }),
    },
  })

  return widget
}

export async function removeWidget(
  tenantId: string,
  userId: string,
  dashboardId: string,
  widgetId: string
) {
  // Verify dashboard ownership
  const dashboard = await db.dashboard.findFirst({
    where: { id: dashboardId, tenantId, userId },
  })

  if (!dashboard) {
    throw new Error('Dashboard không tồn tại hoặc bạn không có quyền chỉnh sửa')
  }

  await db.dashboardWidget.delete({
    where: { id: widgetId },
  })
}

export const dashboardService = {
  list,
  getById,
  create,
  update,
  delete: remove,
  addWidget,
  updateWidget,
  removeWidget,
}
