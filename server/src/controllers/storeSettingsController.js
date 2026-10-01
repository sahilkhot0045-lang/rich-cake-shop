import { StoreSettings } from '../models/StoreSettings.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { DeliverySlot } from '../models/DeliverySlot.js';

export const getPublicStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: 'Rich Cake Shop',
        tagline: 'Artisanal Handcrafted Celebration Cakes & Confections',
        phone: '+91 98200 98200',
        email: 'hello@richcakeshop.com',
      });
    }

    const [deliveryZones, deliverySlots] = await Promise.all([
      DeliveryZone.find({ isActive: true }).select('zoneName pincodes deliveryFee freeDeliveryThreshold estimatedHours'),
      DeliverySlot.find({ isActive: true }).sort({ displayOrder: 1, startTime: 1 }),
    ]);

    res.status(200).json({
      success: true,
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        businessHours: settings.businessHours,
        orderCutoffLeadHours: settings.orderCutoffLeadHours,
        paymentOptions: settings.paymentOptions,
        heroBanner: settings.heroBanner,
        policies: settings.policies,
        holidays: settings.holidays,
        deliveryZones,
        deliverySlots,
      },
    });
  } catch (error) {
    next(error);
  }
};
