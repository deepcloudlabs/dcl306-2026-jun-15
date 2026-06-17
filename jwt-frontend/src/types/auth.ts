export type UserRole = "admin" | "user";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginResponse = {
  accessToken: string;
  user: PublicUser;
};

export type ApiMessage<TPayload = unknown> = {
  message: string;
} & TPayload;
