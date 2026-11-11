import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
});
export type CredentialsDto = z.infer<typeof credentialsSchema>;

export type UserDto = {
  id: string;
  email: string;
};

export type AuthResponseDto = {
  accessToken: string;
  user: UserDto;
};
