export interface VerifyDTO{
    email: string,
    otp: number
}

export interface resendDTO extends Partial<VerifyDTO>{
}