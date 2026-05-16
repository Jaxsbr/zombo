import Phaser from 'phaser';

// Centralised FX wrappers. A future Phaser 4 migration should only need to
// rewrite this file — call sites stay stable.
//
// Phaser 3 splits effects into preFX (texture-backed objects only) and postFX
// (anything). We use postFX everywhere for portability; cost is a per-target
// render texture, which is fine at the scale of this game.

type PostFXTarget = Phaser.GameObjects.GameObject & {
  postFX?: Phaser.GameObjects.Components.FX;
};

export function addObjectGlow(target: PostFXTarget, color: number, strength = 4): void {
  // outerStrength, innerStrength, knockout, quality, distance
  target.postFX?.addGlow(color, strength, 0, false, 0.1, 8);
}

// Quick expanding burst at (x, y) — used for muzzle flashes when a defender
// fires. Self-cleaning: destroys itself when the tween completes.
export function spawnMuzzleFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
): void {
  const flash = scene.add.graphics();
  flash.fillStyle(color, 0.9);
  flash.fillCircle(0, 0, 6);
  flash.fillStyle(0xffffff, 0.7);
  flash.fillCircle(0, 0, 3);
  flash.setPosition(x, y);
  flash.setDepth(6); // above entities (5), below sparks (10)
  scene.tweens.add({
    targets: flash,
    scale: 2.2,
    alpha: 0,
    duration: 180,
    ease: 'Quad.easeOut',
    onComplete: () => flash.destroy(),
  });
}

