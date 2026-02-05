class ParallaxController {
  constructor() {
    this.root = document.documentElement;

    this.current = 0;
    this.target = 0;

    this.centerThreshold = 0.15;
    this.ease = 0.08;

    this.useGyro = false;
    this.maxTilt = 20; // degrees (clamp for sanity)

    this.animate = this.animate.bind(this);
    this.handleOrientation = this.handleOrientation.bind(this);

    this.init();
  }

  init() {
    // Mouse
    document.addEventListener("mousemove", (e) => {
      if (this.useGyro) return;
      this.setTarget(this.calculateDirection(e.clientX, window.innerWidth));
    });

    document.addEventListener("mouseleave", () => {
      if (!this.useGyro) this.setTarget(0);
    });

    // Touch
    document.addEventListener(
      "touchmove",
      (e) => {
        if (this.useGyro || !e.touches.length) return;
        this.setTarget(
          this.calculateDirection(e.touches[0].clientX, window.innerWidth)
        );
      },
      { passive: true }
    );

    document.addEventListener("touchend", () => {
      if (!this.useGyro) this.setTarget(0);
    });

    requestAnimationFrame(this.animate);
  }

  /* -------------------------
     INPUT NORMALIZATION
  ------------------------- */

  calculateDirection(x, width) {
    const normalized = (x / width) * 2 - 1;

    if (Math.abs(normalized) < this.centerThreshold) return 0;
    return normalized < 0 ? -1 : 1;
  }

  calculateGyroDirection(gamma) {
    // Clamp tilt
    const clamped = Math.max(
      -this.maxTilt,
      Math.min(this.maxTilt, gamma)
    );

    const normalized = clamped / this.maxTilt;

    if (Math.abs(normalized) < this.centerThreshold) return 0;
    return normalized < 0 ? -1 : 1;
  }

  /* -------------------------
     GYRO
  ------------------------- */

  enableGyro() {
    this.useGyro = true;
    window.addEventListener("deviceorientation", this.handleOrientation, true);
  }

  handleOrientation(e) {
    if (e.gamma == null) return;
    this.setTarget(this.calculateGyroDirection(e.gamma));
  }

  /* -------------------------
     CORE
  ------------------------- */

  setTarget(value) {
    this.target = value;
  }

  animate() {
    this.current += (this.target - this.current) * this.ease;

    if (Math.abs(this.current) < 0.001) this.current = 0;

    this.root.style.setProperty(
      "--parallax-direction",
      this.current.toFixed(4)
    );

    requestAnimationFrame(this.animate);
  }
}

/* -------------------------
   INIT
------------------------- */

const controller = new ParallaxController();

/* -------------------------
   GYRO BUTTON LOGIC
------------------------- */

window.enableGyroExperience = async function () {
  // iOS permission
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") return;
    } catch {
      return;
    }
  }

  controller.enableGyro();

  const btn = document.getElementById("gyro-btn");
  if (btn) btn.remove();
};
const gyroBtn = document.getElementById("gyro-btn");

// REAL mobile check (not media-query fantasy)
const isTouchDevice =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

const hasGyro = "DeviceOrientationEvent" in window;

if (isTouchDevice && hasGyro) {
  gyroBtn.style.opacity = "1";
  gyroBtn.style.pointerEvents = "auto";
} else {
  gyroBtn.remove(); // desktop = gone
}
