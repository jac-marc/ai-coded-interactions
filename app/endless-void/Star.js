export class Star {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true);
  }

  reset(canvasWidth, canvasHeight, initial = false) {
    this.x = Math.random() * canvasWidth - canvasWidth / 2;
    this.y = Math.random() * canvasHeight - canvasHeight / 2;
    this.z = initial ? Math.random() * canvasWidth : canvasWidth;
    this.prevZ = this.z;
  }

  update(speed, canvasWidth, canvasHeight) {
    this.prevZ = this.z;
    this.z -= speed;

    if (this.z <= 0) {
      this.reset(canvasWidth, canvasHeight);
    }
  }

  draw(ctx, canvasWidth, canvasHeight, centerX, centerY, trailOpacity) {
    const sx = (this.x / this.z) * centerX + centerX;
    const sy = (this.y / this.z) * centerY + centerY;

    const prevSx = (this.x / this.prevZ) * centerX + centerX;
    const prevSy = (this.y / this.prevZ) * centerY + centerY;

    const size = (1 - this.z / canvasWidth) * 2;

    ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - this.z / canvasWidth) * trailOpacity})`;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(prevSx, prevSy);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

