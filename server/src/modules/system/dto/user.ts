import { User as PrismaUser } from '@prisma/client';

export type User = PrismaUser & {};

export type UserDto = PrismaUser & {
  roles: string[]; // 添加新的 rules 属性
};

export type ResUser = {
  records: UserDto[];
  total: number;
  currentPage: number;
  pageSize: number;
};

export type InputUser = {
  username: string;
  password: string;
  nickName: string;
  roles: string[];
  phone: string;
  email: string;
};
