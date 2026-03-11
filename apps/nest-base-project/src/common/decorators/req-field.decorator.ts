import { createParamDecorator, ExecutionContext } from '@nestjs/common';

function getByPath(obj: Record<string, unknown>, path?: string): unknown {
  if (!path) return obj;
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc == null ? undefined : (acc as Record<string, unknown>)[key],
      obj,
    );
}

export const ReqField = createParamDecorator(
  (path: string | undefined, ctx: ExecutionContext): unknown => {
    const req = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    return getByPath(req, path);
  },
);
