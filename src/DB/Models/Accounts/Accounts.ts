import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../../connection.ts";

export type AccountType = "BANK_ACCOUNT" | "WALLET";

class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  declare accountId: CreationOptional<string>;

  declare userId: string;
  declare type: AccountType;
  declare balance: CreationOptional<number>;
  declare currency: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
}

Account.init(
  {
    accountId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "account_id",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    type: {
      type: DataTypes.ENUM("BANK_ACCOUNT", "WALLET"),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(19, 4),
      allowNull: false,
      defaultValue: 0,
      // Sequelize returns DECIMAL as a string to preserve precision; keep it
      // numeric on the way out so callers can do math without re-parsing.
      get(this: Account) {
        const raw = this.getDataValue("balance") as unknown as string | null;
        return raw === null ? null : Number(raw);
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "EGP",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "accounts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default Account;
