import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  loggedInSession: {
    type: JSON,
    current: {
      type: JSON,
      ip: {
        type: String,
      },
      address: {
        type: String,
      },
      time: {
        type: String,
      },
    },
    previous: {
      type: JSON,
      ip: {
        type: String,
      },
      address: {
        type: String,
      },
      time: {
        type: String,
      },
    },
  },
  mobileNumber: { type: String, required: true, unique: true },
  mobileNumberVerified: { type: Boolean, default: false },
  countryCode: String,
  gender: {
    type: String,
    enum: ["Male", "Female"],
    //required: [true, "Please provide your gender"],
  },
  dob: {
    type: String,
    //required: [true, "Please provide your Date of Birth"]
  },
  seriesNo: {
    type: String,
  },
  password: {
    type: String,
    //required: true,
    required: function () {
      if (this.type != 2) {
        return true;
      }
      else {
        return false;
      }
    },
    minlength: 8,
    maxlength: 64,
  },
  passwordConfirm: {
    type: String,
  },
  type: {
    type: Number,
    default: 1,
  }, // type 1 = Admin, 2 = Vendor, 3 = Customer
  resetPassword: {
    type: JSON,
    code: {
      type: String,
    },
    expireTime: {
      type: Date,
    },
  },
  otp: {
    type: JSON,
    code: {
      type: String,
    },
    expireTime: {
      type: Date,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false,
  },
  image: {
    type: String,
    default: "default.jpg",
  },
  roles: {
    type: String,
    enum: ["super-admin", "admin", "user"],
    default: "user",
  },
  accessPermission: [
    {
      type: String,
    },
  ],
  facebookAuthId: {
    type: String,
    // unique: true
  },
  googleAuthId: {
    type: String,
    // unique: true
  },
  stripeCustomerId: {
    type: String,
  },
  sessionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};
const User = mongoose.model("user", userSchema);

export default User;
