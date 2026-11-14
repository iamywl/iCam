// Web Camera getUserMedia lifecycle controller with front/rear toggle & still capture

export class CameraController {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.facingMode = "environment";
    this.isActive = false;
    this.error = null;
  }

  async start() {
    this.stop();
    this.error = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.error = "이 브라우저 컨텍스트에서는 카메라 접근(HTTPS 또는 localhost 필요)이 제한됩니다. 'Open Photo'로 사진 테스트를 이용하세요.";
      return false;
    }

    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1440 }
        }
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.isActive = true;
      return true;
    } catch (err) {
      // Fallback to unconstrained video (helpful on desktop webcams that reject facingMode)
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        this.video.srcObject = this.stream;
        await this.video.play();
        this.isActive = true;
        return true;
      } catch (err2) {
        this.error = `카메라 연결 실패: ${err2.message || err.message}. 'Open Photo'로 이미지를 불러와 테스트할 수 있습니다.`;
        this.isActive = false;
        return false;
      }
    }
  }

  async flipLens() {
    this.facingMode = this.facingMode === "environment" ? "user" : "environment";
    return this.start();
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.isActive = false;
  }

  get shouldMirror() {
    return this.facingMode === "user";
  }
}
