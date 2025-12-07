import { createParamDecorator, ExecutionContext } from '@nestjs/common';

function getByPath(obj: any, path?: string) {
  if (!path) return obj;
  return path
    .split('.')
    .reduce(
      (acc, key) => (acc == null || acc === undefined ? undefined : acc[key]),
      obj,
    );
}

export const ReqField = createParamDecorator(
  (path: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return getByPath(req, path);
  },
);
