/**
 * Audit Store Implementations
 * Stores audit entries in different backends
 */

import { PrismaClient } from "@prisma/client";
import { AuditAction, AuditEntry, AuditQueryOptions, Change } from "./types";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Interface for audit storage backends
 */
export interface AuditStore {
  write(entry: {
    timestamp: Date;
    userId: string;
    userName: string;
    module: string;
    entity: string;
    entityId: string;
    action: AuditAction;
    changes: Change[];
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void>;

  query(options: AuditQueryOptions): Promise<AuditEntry[]>;

  count(options: Omit<AuditQueryOptions, "limit" | "offset">): Promise<number>;

  export(format: "json" | "csv", dateFrom?: Date, dateTo?: Date): Promise<string>;

  purge(olderThan: Date): Promise<number>;
}

/**
 * Prisma-based audit store
 */
export class PrismaAuditStore implements AuditStore {
  constructor(private prisma: PrismaClient) {}

  async write(entry: {
    timestamp: Date;
    userId: string;
    userName: string;
    module: string;
    entity: string;
    entityId: string;
    action: AuditAction;
    changes: Change[];
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          timestamp: entry.timestamp,
          userId: entry.userId,
          userName: entry.userName,
          module: entry.module,
          entity: entry.entity,
          entityId: entry.entityId,
          action: entry.action,
          changes: entry.changes,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata,
        },
      });
    } catch (error) {
      console.error("Error writing audit entry to Prisma:", error);
      throw error;
    }
  }

  async query(options: AuditQueryOptions): Promise<AuditEntry[]> {
    const where: any = {};

    if (options.module) where.module = options.module;
    if (options.entity) where.entity = options.entity;
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;

    if (options.dateFrom || options.dateTo) {
      where.timestamp = {};
      if (options.dateFrom) where.timestamp.gte = options.dateFrom;
      if (options.dateTo) where.timestamp.lte = options.dateTo;
    }

    const entries = await (this.prisma as any).auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: options.limit,
      skip: options.offset,
    });

    return entries.map((entry: any) => this.formatEntry(entry));
  }

  async count(options: Omit<AuditQueryOptions, "limit" | "offset">): Promise<number> {
    const where: any = {};

    if (options.module) where.module = options.module;
    if (options.entity) where.entity = options.entity;
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;

    if (options.dateFrom || options.dateTo) {
      where.timestamp = {};
      if (options.dateFrom) where.timestamp.gte = options.dateFrom;
      if (options.dateTo) where.timestamp.lte = options.dateTo;
    }

    return (this.prisma as any).auditLog.count({ where });
  }

  async export(
    format: "json" | "csv",
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<string> {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    const entries = await (this.prisma as any).auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    if (format === "json") {
      return JSON.stringify(
        entries.map((entry: any) => this.formatEntry(entry)),
        null,
        2
      );
    } else {
      // CSV format
      const csvEntries = entries.map((entry: any) => {
        const formatted = this.formatEntry(entry);
        return {
          timestamp: formatted.timestamp.toISOString(),
          userId: formatted.userId,
          userName: formatted.userName,
          module: formatted.module,
          entity: formatted.entity,
          entityId: formatted.entityId,
          action: formatted.action,
          changesCount: formatted.changes.length,
          ipAddress: formatted.ipAddress || "",
          userAgent: formatted.userAgent || "",
        };
      });

      const headers = Object.keys(csvEntries[0] || {});
      const csv = [
        headers.join(","),
        ...csvEntries.map((row: any) =>
          headers
            .map((h) => {
              const val = row[h];
              if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            })
            .join(",")
        ),
      ].join("\n");

      return csv;
    }
  }

  async purge(olderThan: Date): Promise<number> {
    const result = await (this.prisma as any).auditLog.deleteMany({
      where: {
        timestamp: {
          lt: olderThan,
        },
      },
    });

    return result.count || 0;
  }

  private formatEntry(entry: any): AuditEntry {
    return {
      id: entry.id,
      timestamp: entry.timestamp,
      userId: entry.userId,
      userName: entry.userName,
      module: entry.module,
      entity: entry.entity,
      entityId: entry.entityId,
      action: entry.action,
      changes: entry.changes || [],
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata,
    };
  }
}

/**
 * File-based audit store (JSONL format)
 * Useful for backup and export
 */
export class FileAuditStore implements AuditStore {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async write(entry: {
    timestamp: Date;
    userId: string;
    userName: string;
    module: string;
    entity: string;
    entityId: string;
    action: AuditAction;
    changes: Change[];
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    const line = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    });

    try {
      await fs.appendFile(this.filePath, line + "\n");
    } catch (error) {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(this.filePath, line + "\n");
    }
  }

  async query(options: AuditQueryOptions): Promise<AuditEntry[]> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      const lines = content.trim().split("\n").filter((line) => line);

      let entries = lines.map((line) => {
        const parsed = JSON.parse(line);
        return {
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        };
      });

      // Apply filters
      if (options.module) {
        entries = entries.filter((e) => e.module === options.module);
      }
      if (options.entity) {
        entries = entries.filter((e) => e.entity === options.entity);
      }
      if (options.userId) {
        entries = entries.filter((e) => e.userId === options.userId);
      }
      if (options.action) {
        entries = entries.filter((e) => e.action === options.action);
      }
      if (options.dateFrom) {
        entries = entries.filter((e) => e.timestamp >= options.dateFrom!);
      }
      if (options.dateTo) {
        entries = entries.filter((e) => e.timestamp <= options.dateTo!);
      }

      // Sort by timestamp descending
      entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply pagination
      return entries.slice(options.offset, options.offset + options.limit);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async count(options: Omit<AuditQueryOptions, "limit" | "offset">): Promise<number> {
    const entries = await this.query({
      ...options,
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0,
    });
    return entries.length;
  }

  async export(
    format: "json" | "csv",
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<string> {
    const entries = await this.query({
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0,
      dateFrom,
      dateTo,
    });

    if (format === "json") {
      return JSON.stringify(entries, null, 2);
    } else {
      // CSV format
      const csvEntries = entries.map((entry) => ({
        timestamp: entry.timestamp.toISOString(),
        userId: entry.userId,
        userName: entry.userName,
        module: entry.module,
        entity: entry.entity,
        entityId: entry.entityId,
        action: entry.action,
        changesCount: entry.changes.length,
        ipAddress: entry.ipAddress || "",
        userAgent: entry.userAgent || "",
      }));

      const headers = Object.keys(csvEntries[0] || {});
      const csv = [
        headers.join(","),
        ...csvEntries.map((row) =>
          headers
            .map((h) => {
              const val = row[h as keyof typeof row];
              if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            })
            .join(",")
        ),
      ].join("\n");

      return csv;
    }
  }

  async purge(olderThan: Date): Promise<number> {
    try {
      const entries = await this.query({
        limit: Number.MAX_SAFE_INTEGER,
        offset: 0,
      });

      const toKeep = entries.filter((e) => e.timestamp >= olderThan);
      const purged = entries.length - toKeep.length;

      const content = toKeep.map((e) => JSON.stringify({
        ...e,
        timestamp: e.timestamp.toISOString(),
      })).join("\n");

      await fs.writeFile(this.filePath, content + "\n");
      return purged;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return 0;
      }
      throw error;
    }
  }
}
