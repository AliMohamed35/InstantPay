import User from "./User/User.ts";
import Account from "./Accounts/Accounts.ts";
import Transaction from "./Transactions/Transaction.ts";
import LedgerEntry from "./LedgerEntries/LedgerEntry.ts";

// ---------------------------------------------------------------------------
// Associations are declared here, in one place, after every model is defined.
// Doing it inside the model files risks circular imports; centralizing keeps
// the dependency graph flat and the relationships easy to read at a glance.
// ---------------------------------------------------------------------------

// A user owns many accounts; every account belongs to exactly one user.
User.hasMany(Account, {
  foreignKey: "userId",
  sourceKey: "userId",
  as: "accounts",
});
Account.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "userId",
  as: "user",
});

// A transaction (the header) has many ledger lines; each line belongs to it.
Transaction.hasMany(LedgerEntry, {
  foreignKey: "transactionId",
  sourceKey: "transactionId",
  as: "entries",
});
LedgerEntry.belongsTo(Transaction, {
  foreignKey: "transactionId",
  targetKey: "transactionId",
  as: "transaction",
});

// Each ledger line moves money on exactly one account; an account accumulates
// many lines (its full history — the source of truth behind the cached balance).
Account.hasMany(LedgerEntry, {
  foreignKey: "accountId",
  sourceKey: "accountId",
  as: "entries",
});
LedgerEntry.belongsTo(Account, {
  foreignKey: "accountId",
  targetKey: "accountId",
  as: "account",
});

export { User, Account, Transaction, LedgerEntry };
