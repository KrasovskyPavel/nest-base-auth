import { User } from '@prisma/client';

export type UserWithLastAvatar = Pick<
  User,
  'id' | 'login' | 'email' | 'age' | 'description'
> & {
  lastAvatar: {
    id: string;
    path: string;
    isActive: boolean;
    createdAt: Date;
  } | null;
};
