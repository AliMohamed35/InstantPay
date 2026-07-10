export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface PartialUpdateDTO extends UpdateUserDTO {}
