export enum AccountType{
    BANK_ACCOUNT = "BANK_ACCOUNT",
    WALLET = "WALLET",
}

export enum CurrencyType{
    EGYPTIAN_POUND = "EGYPTIAN_POUND",
    DOLLAR = "DOLLAR",
}

export interface addAccountDTO{
    userId: any,
    accountNumber: string,
    type: AccountType,
    currency: CurrencyType
}

export interface accountCreatedDTO{
    accountNumber: string,
    type: AccountType,
    currency: CurrencyType
}
