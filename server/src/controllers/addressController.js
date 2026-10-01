import { Address } from '../models/Address.js';
import { User } from '../models/User.js';

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { recipientName, phone, streetAddress, landmark, city, state, pincode, addressType, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user.id,
      recipientName,
      phone,
      streetAddress,
      landmark,
      city: city || 'Mumbai',
      state: state || 'Maharashtra',
      pincode,
      addressType: addressType || 'home',
      isDefault: Boolean(isDefault),
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { savedAddresses: address._id },
    });

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    let address = await Address.findOne({ _id: id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { savedAddresses: id },
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
