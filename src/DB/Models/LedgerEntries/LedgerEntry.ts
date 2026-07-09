import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../../connection.ts";

// The LINES: many rows per transaction. Each is a signed, immutable fact —
// -50 debit, +50 credit. No status: a ledger line is not a stateful thing.
class LedgerEntry extends Model<
  InferAttributes<LedgerEntry>,
  InferCreationAttributes<LedgerEntry>
> {
  declare entryId: CreationOptional<string>;

  declare transactionId: string;
  declare accountId: string;
  declare amount: number;

  declare createdAt: CreationOptional<Date>;
}

LedgerEntry.init(
  {
    entryId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "entry_id",
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "transaction_id",
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "account_id",
    },
    amount: {
      // SIGNED DECIMAL — never float.
      type: DataTypes.DECIMAL(19, 4),
      allowNull: false,
      get(this: LedgerEntry) {
        const raw = this.getDataValue("amount") as unknown as string | null;
        return raw === null ? null : Number(raw);
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "ledger_entries",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default LedgerEntry;
