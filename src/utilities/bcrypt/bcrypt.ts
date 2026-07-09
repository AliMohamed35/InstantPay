import bcrypt from "bcrypt";

export async function hashPassword (password: string){
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashPassword: string){
    return await bcrypt.compare(password, hashPassword);
}

export async function hashRefresh(refreshToken: string){
    return await bcrypt.hash(refreshToken, 10);
}

export async function compareRefresh(refreshToken: string, hashedRefresh: string){
    return await bcrypt.compare(refreshToken, hashedRefresh);
}