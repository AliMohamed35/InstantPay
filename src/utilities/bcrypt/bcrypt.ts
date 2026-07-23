import bcrypt from "bcrypt";

export async function hashPassword (password: string){
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashPassword: string){
    return await bcrypt.compare(password, hashPassword);
}

export async function comparePin(pin: string, hashPin: string){
    return await bcrypt.compare(pin, hashPin);
}
