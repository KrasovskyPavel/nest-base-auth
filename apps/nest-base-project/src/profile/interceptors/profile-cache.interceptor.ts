import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Inject, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';

interface RequestWithUser {
  url?: string;
  user?: { id: string };
}

@Injectable()
export class ProfileCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const url = request.url ?? '';

    if (url.includes('me') && request.user?.id) {
      return `profile:me:${request.user.id}`;
    }
    if (url.includes('get-all-users')) {
      return `profile:get-all-users:${url}`;
    }

    return undefined;
  }
}
