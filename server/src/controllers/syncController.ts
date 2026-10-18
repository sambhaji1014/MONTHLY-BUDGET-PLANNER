import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * GET /api/sync
 * Retrieves the complete synchronized financial portfolio for the authenticated user or requested email/userId.
 * Enables instantaneous restoration of user data across any browser or device.
 */
export const getFullSync = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queryEmail = req.query.email as string | undefined;
    const queryUserId = req.query.userId as string | undefined;
    const target = req.user?.userId || req.user?.email || queryEmail || queryUserId || 'usr_sambhaji_jadhav';

    const fullSync = await repository.getUserFullSync(target);

    return res.json({
      success: true,
      data: fullSync,
    });
  } catch (error: any) {
    console.error('getFullSync error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve cloud sync data.' });
  }
};

/**
 * POST /api/sync
 * Saves the entire financial state for the user to the persistent server database.
 * Ensures data entered in one browser is preserved and ready to be restored anywhere.
 */
export const saveFullSync = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, userId, monthlyIncome, categories, transactions, goals, bills, userProfile } = req.body;
    const target = req.user?.userId || req.user?.email || userId || email || userProfile?.email || 'usr_sambhaji_jadhav';

    const result = await repository.saveUserFullSync(target, {
      monthlyIncome,
      categories,
      transactions,
      goals,
      bills,
      userProfile,
    });

    return res.json({
      success: true,
      message: 'Financial portfolio synchronized and securely persisted to server database.',
      savedAt: result.savedAt,
    });
  } catch (error: any) {
    console.error('saveFullSync error:', error);
    return res.status(500).json({ success: false, error: 'Failed to persist sync data.' });
  }
};
