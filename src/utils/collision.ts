import type { GameObject, Platform, Position, Size } from '../types/game';

export const checkCollision = (
  obj1: Position & Size,
  obj2: Position & Size
): boolean => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
};

export const checkPlatformCollision = (
  player: GameObject,
  platform: Platform,
  tolerance: number = 20
): 'top' | 'bottom' | 'left' | 'right' | null => {
  if (!checkCollision(player, platform)) return null;

  // Calculate overlap on each side
  const overlapLeft = player.x + player.width - platform.x;
  const overlapRight = platform.x + platform.width - player.x;
  const overlapTop = player.y + player.height - platform.y;
  const overlapBottom = platform.y + platform.height - player.y;

  // Find minimum overlap
  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  // Determine collision side
  if (minOverlap === overlapTop && player.velocityY >= 0 && overlapTop < tolerance) {
    return 'top';
  } else if (minOverlap === overlapBottom && player.velocityY < 0) {
    return 'bottom';
  } else if (minOverlap === overlapLeft && player.velocityX > 0) {
    return 'left';
  } else if (minOverlap === overlapRight && player.velocityX < 0) {
    return 'right';
  }

  return null;
};

export const isOnGround = (player: GameObject, platforms: Platform[]): boolean => {
  for (const platform of platforms) {
    if (platform.broken) continue;

    const collision = checkPlatformCollision(player, platform);
    if (collision === 'top') {
      return true;
    }
  }
  return false;
};
