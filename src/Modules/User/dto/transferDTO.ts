export interface TransferDTO {
  senderAccountId: string;
  receiverAccountId: string;
  amount: number;
  pin: string;
}

export interface TransferAccountNumberDTO {
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  pin: string;
}
