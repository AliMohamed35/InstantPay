import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../../connection.ts";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userId: CreationOptional<string>;

  declare firstName: string | null;
  declare lastName: string | null;
  declare phoneNumber: string | null;

  declare email: string;

  declare passwordHash: string;
  declare pinHash: string;
  declare isActive: number;

  declare accessToken: string | null;
  declare refreshToken: string | null;

  declare OTP: number | null;
  declare isVerified: number | null;

  declare isDeleted: number | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "user_id",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "last_name",
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "phone_number",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    pinHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "pin_hash",
    },
    isActive: { type: DataTypes.INTEGER, defaultValue: 0 },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "access_token",
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "refresh_token",
    },
    OTP: { type: DataTypes.INTEGER, allowNull: true, field: "OTP" },
    isVerified: { type: DataTypes.INTEGER, defaultValue: 0, field: "isVerified" },
    isDeleted: { type: DataTypes.INTEGER, defaultValue: 0, field: "isDeleted" },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default User;
