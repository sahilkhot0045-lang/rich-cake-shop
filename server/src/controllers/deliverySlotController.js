import { DeliverySlot } from '../models/DeliverySlot.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { Order } from '../models/Order.js';

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date, orderType = 'delivery' } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date (YYYY-MM-DD)' });
    }

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ success: false, message: 'Date cannot be in the past' });
    }

    const settings = await StoreSettings.findOne();
    const holidays = settings?.holidays || [];

    // Check if requested date falls on a holiday
    const isHoliday = holidays.some((h) => {
      const hDate = new Date(h);
      hDate.setHours(0, 0, 0, 0);
      return hDate.getTime() === requestedDate.getTime();
    });

    if (isHoliday) {
      return res.status(200).json({
        success: true,
        isStoreOpen: false,
        message: 'Bakery is closed for scheduled holiday on this date.',
        slots: [],
      });
    }

    // Query active slots
    const slots = await DeliverySlot.find({ isActive: true }).sort({ displayOrder: 1, startTime: 1 });

    const nextDay = new Date(requestedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Count existing active orders for each slot on this date
    const bookedCounts = await Order.aggregate([
      {
        $match: {
          deliveryDate: { $gte: requestedDate, $lt: nextDay },
          orderStatus: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: '$deliverySlot',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    bookedCounts.forEach((b) => {
      countMap[b._id.toString()] = b.count;
    });

    // Check cutoff times if requestedDate is today
    const now = new Date();
    const isToday = requestedDate.getTime() === today.getTime();
    const cutoffHours = settings?.orderCutoffLeadHours || 4;

    const slotResults = slots.map((slot) => {
      const booked = countMap[slot._id.toString()] || 0;
      const remainingCapacity = Math.max(0, slot.maxCapacity - booked);

      let isTimeFeasible = true;
      if (isToday) {
        const [slotStartHour] = slot.startTime.split(':').map(Number);
        const currentHour = now.getHours();
        if (slotStartHour - currentHour < cutoffHours) {
          isTimeFeasible = false;
        }
      }

      const isAvailable = remainingCapacity > 0 && isTimeFeasible;

      return {
        _id: slot._id,
        slotName: slot.slotName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: slot.maxCapacity,
        bookedCount: booked,
        remainingCapacity,
        isAvailable,
        reason: !isTimeFeasible
          ? `Cutoff passed (${cutoffHours}h preparation time required)`
          : remainingCapacity <= 0
          ? 'Slot fully booked'
          : null,
      };
    });

    res.status(200).json({
      success: true,
      isStoreOpen: true,
      date,
      orderType,
      slots: slotResults,
    });
  } catch (error) {
    next(error);
  }
};
