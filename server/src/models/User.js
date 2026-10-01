import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    savedAddresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate JWT Auth Token
userSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET || 'super_secret_rich_cake_shop_jwt_token_key_change_in_production_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    secret,
    { expiresIn }
  );
};

export const User = mongoose.model('User', userSchema);
