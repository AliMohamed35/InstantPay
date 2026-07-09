import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../../connection.ts";

export type TransactionType =
  | "TRANSFER"
  | "SELF_TRANSFER"
  | "UNIFY"
  | "DEPOSIT"
  | "WITHDRAWAL";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

// The HEADER: one row per logical operation. No amount lives here —
// the signed amounts are the ledger lines (see LedgerEntry).
class Transaction extends Model<
  InferAttributes<Transaction>,
  InferCreationAttributes<Transaction>
> {
  declare transactionId: CreationOptional<string>;

  declare referenceNumber: string;
  declare type: TransactionType;
  declare status: CreationOptional<TransactionStatus>;

  declare createdAt: CreationOptional<Date>;
}

Transaction.init(
  {
    transactionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "transaction_id",
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "reference_number",
    },
    type: {
      type: DataTypes.ENUM(
        "TRANSFER",
        "SELF_TRANSFER",
        "UNIFY",
        "DEPOSIT",
        "WITHDRAWAL"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "transactions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default Transaction;
