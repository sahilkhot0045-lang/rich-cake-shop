import { AdminAuditLog } from '../models/AdminAuditLog.js';

export const logAdminAction = async ({ adminId, action, targetEntity, targetId = '', details = {}, req = null }) => {
  try {
    const ipAddress = req ? req.ip || req.connection?.remoteAddress || '' : '';
    await AdminAuditLog.create({
      admin: adminId,
      action,
      targetEntity,
      targetId: String(targetId),
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
  }
};
