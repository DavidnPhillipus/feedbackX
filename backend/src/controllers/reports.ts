import type { RequestHandler } from "express";
import prisma from "../prisma.js";

const ALLOWED_TYPES = new Set(["user", "post", "reply", "message"]);
const ALLOWED_REASONS = new Set([
  "spam",
  "harassment",
  "hate",
  "inappropriate",
  "misinformation",
  "other",
]);
const ALLOWED_STATUSES = new Set(["open", "resolved", "dismissed"]);

function formatReport(report: any) {
  return {
    id: report.id,
    reporterId: report.reporterId,
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    reportedUserId: report.reportedUserId,
    createdAt: report.createdAt,
    reviewedAt: report.reviewedAt,
    reviewerNote: report.reviewerNote,
    reporter: report.reporter
      ? {
          id: report.reporter.id,
          name: report.reporter.name,
          username: report.reporter.username,
          avatarUrl: report.reporter.avatarUrl,
        }
      : null,
    reportedUser: report.reportedUser
      ? {
          id: report.reportedUser.id,
          name: report.reportedUser.name,
          username: report.reportedUser.username,
          avatarUrl: report.reportedUser.avatarUrl,
        }
      : null,
  };
}

export const createReport: RequestHandler = async (req, res) => {
  const targetType = String(req.body?.targetType || "").toLowerCase();
  const targetId = String(req.body?.targetId || "").trim();
  const reason = String(req.body?.reason || "").toLowerCase();
  const details = req.body?.details ? String(req.body.details).slice(0, 1000) : null;
  let reportedUserId =
    req.body?.reportedUserId != null
      ? Number.parseInt(String(req.body.reportedUserId), 10)
      : null;

  if (!ALLOWED_TYPES.has(targetType)) {
    return res.status(400).json({ error: "Invalid report target type" });
  }
  if (!targetId) {
    return res.status(400).json({ error: "targetId is required" });
  }
  if (!ALLOWED_REASONS.has(reason)) {
    return res.status(400).json({
      error: "Invalid reason. Use spam, harassment, hate, inappropriate, misinformation, or other",
    });
  }

  if (targetType === "user") {
    reportedUserId = Number.parseInt(targetId, 10);
  } else if (targetType === "post" && !reportedUserId) {
    const post = await prisma.post.findUnique({
      where: { id: Number.parseInt(targetId, 10) },
      select: { userId: true },
    });
    reportedUserId = post?.userId ?? null;
  }

  if (reportedUserId === req.user?.id) {
    return res.status(400).json({ error: "You cannot report yourself" });
  }

  const recent = await prisma.report.findFirst({
    where: {
      reporterId: req.user.id,
      targetType,
      targetId,
      status: "open",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) {
    return res.status(409).json({ error: "You already reported this recently" });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: req.user.id,
      targetType,
      targetId,
      reason,
      details,
      reportedUserId: Number.isFinite(reportedUserId as number) ? reportedUserId : null,
    },
    include: {
      reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
      reportedUser: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  res.status(201).json({ report: formatReport(report) });
};

export const listReports: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit || "30"), 10)));
  const skip = (page - 1) * limit;
  const status = String(req.query.status || "open").toLowerCase();

  const where: Record<string, unknown> = {};
  if (status !== "all" && ALLOWED_STATUSES.has(status)) {
    where.status = status;
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
        reportedUser: { select: { id: true, name: true, username: true, avatarUrl: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  res.json({
    reports: reports.map(formatReport),
    page,
    limit,
    total,
    hasMore: skip + reports.length < total,
  });
};

export const updateReport: RequestHandler = async (req, res) => {
  const reportId = Number.parseInt(String(req.params.id), 10);
  if (!Number.isFinite(reportId)) {
    return res.status(400).json({ error: "Invalid report id" });
  }

  const status = String(req.body?.status || "").toLowerCase();
  if (!ALLOWED_STATUSES.has(status) || status === "open") {
    return res.status(400).json({ error: "Status must be resolved or dismissed" });
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      reviewedAt: new Date(),
      reviewerNote: req.body?.reviewerNote
        ? String(req.body.reviewerNote).slice(0, 500)
        : null,
    },
    include: {
      reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
      reportedUser: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  res.json({ report: formatReport(report) });
};
