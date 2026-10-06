# 📱 SnapStudio iOS 버전 및 아이폰 기기별 종합 대응 매트릭스
> **Comprehensive iOS Version (16, 17, 18+) & iPhone Device Market Share Matrix**

---

## 1. 최신 아이폰 시장 점유율 분석 (Market Share Research)

### 1) 대한민국(국내) 아이폰 활성 기기 점유율
- **Pro / Pro Max 계열 압도적 우세**: 국내 2030 MZ 세대의 아이폰 구매 비중 중 Pro/Pro Max 계열이 **65% 이상** 차지.
- **1위**: iPhone 15 Pro / 16 (393 × 852 pt) - **~34%**
- **2위**: iPhone 15 Pro Max / 16 Plus / 16 Pro Max (430 × 932 pt ~ 440 × 956 pt) - **~32%**
- **3위**: iPhone 13 / 14 기본형 (390 × 844 pt) - **~18%**
- **4위**: iPhone 12 / 13 mini 및 X/11 Pro (375 × 812 pt) - **~9%**
- **5위**: iPhone SE 2/3 (375 × 667 pt) - **~7%**

### 2) 글로벌(전 세계) 아이폰 활성 기기 점유율
- **기본형 및 구형 보급형 비중 40% 이상 유지**:
  - 6.1인치 표준 노치 & 다이내믹 아일랜드 (390×844, 393×852): **~42%**
  - 6.7~6.9인치 대화면 (428×926, 430×932, 440×956): **~33%**
  - 5.4~5.8인치 컴팩트 (375×812): **~15%**
  - 4.7인치 홈버튼 SE (375×667): **~10%**

---

## 2. 4대 디바이스 티어별 해상도 & 지오메트리 규격

| 디바이스 티어 | 대표 모델 | 논리 해상도 (pt) | 물리 해상도 (px) | 상단 Safe Area | 하단 Safe Area | 뷰파인더 높이 | 드로어 높이 | 하단 섹션 높이 |
|---|---|---|---|---|---|---|---|---|
| **Tier 1 (SE Compact)** | iPhone SE 2/3, 8, 7 | **375 × 667** | 750 × 1334 (@2x) | 22pt (상태바) | 0pt | **316px** | **136px** | **130px** |
| **Tier 2 (Mini Notch)** | iPhone 12/13 mini, X, 11 Pro | **375 × 812** | 1125 × 2436 (@3x) | 44pt (노치) | 34pt | **402px** | **144px** | **146px** |
| **Tier 3 (Standard Pro)** | iPhone 13/14, 15/16, 16 Pro | **393 × 852** (402×874) | 1179 × 2556 (@3x) | 54pt (아일랜드) | 34pt | **436px** | **142px** | **148px** |
| **Tier 4 (Max / Plus)** | 14/15/16 Pro Max, Plus | **430 × 932** (440×956) | 1290 × 2796 (@3x) | 56pt (아일랜드) | 34pt | **484px** | **148px** | **152px** |

---

## 3. iOS 버전별 (iOS 16 / iOS 17 / iOS 18+) 완벽 대응

### 1) iOS 16 대응 (Safari 16, WebKit)
- **동적 뷰포트 단위 폴백**:
  - iOS 16 초기 버전 및 Safari 15 호환을 위해 `height: 100vh`를 선행 선언 후 `height: 100dvh`를 선언하는 2단계 폴백 구조 적용.
- **WebKit 블러 렌더링**:
  - `backdrop-filter` 단독 지원 브라우저를 대비하여 `-webkit-backdrop-filter`를 모든 글래스모피즘 요소에 100% 병기.
- **터치 캘아웃 및 바운스 스크롤 방지**:
  - Safari 브라우저에서 셔터 연타 시 텍스트 선택 창이 뜨거나 화면이 위아래로 출렁이지 않도록 `-webkit-touch-callout: none;`, `user-select: none;`, `overscroll-behavior: none;` 적용.
- **오디오 컨텍스트 언락**:
  - iOS Safari의 무음 정책을 해결하기 위해 첫 터치(`touchstart`, `click`) 시 Web Audio Context를 즉시 `resume()` 처리.

### 2) iOS 17 대응 (Safari 17, WebKit)
- **Display P3 와이드 컬러 가멋 지원**:
  - Color Studio 퍼스널 컬러 및 CineStill 800T 할레이션의 강렬한 네온 레드를 P3 디스플레이에 생생하게 렌더링하도록 sRGB/P3 호환 컬러 스펙 지원.
- **인터랙티브 위젯 연동 준비**:
  - 실시간 배경색 및 카메라 전환 상태를 `CameraViewModel`에 Combine 상태로 격리하여 락스크린/홈스크린 위젯 브릿징 용이성 확보.

### 3) iOS 18+ 대응 (Safari 18, Camera Control API)
- **iPhone 16 시리즈 하드웨어 '카메라 컨트롤(Camera Control)' 대응**:
  - iOS 18에 신설된 `AVCaptureControl` 및 `AVCaptureSystemZoomSlider`를 Swift 네이티브 코어에 선제 구현하여 하드웨어 햅틱 버튼으로 카메라 스위칭 및 줌 조작 연동.
- **다크/틴트 홈스크린 아이콘 규격**:
  - iOS 18의 틴티드 아이콘(Tinted App Icons) 템플릿 마스크 에셋 패키징 포함.
- **풀스크린 PWA 홈 화면 추가 지원**:
  - `apple-mobile-web-app-capable: yes`, `apple-mobile-web-app-status-bar-style: black-translucent`, `viewport-fit=cover` 완벽 적용.

---

## 4. Swift 네이티브 (`iCamCore`) 버전 가드 매트릭스

```swift
// Swift 5.9 / 6.0 iOS 버전 분기 예시

// iOS 18+ 신규 카메라 컨트롤 하드웨어 버튼 연동
@available(iOS 18.0, *)
extension CameraViewController: AVCaptureSessionControlsDelegate {
    func setupCameraControlButtons() {
        let zoomSlider = AVCaptureSystemZoomSlider(device: self.currentDevice)
        self.captureSession.addControl(zoomSlider)
    }
}

// iOS 17+ 안전영역 패딩 및 모던 애니메이터
@available(iOS 17.0, *)
struct ModernViewfinderView: View {
    var body: some View {
        ViewfinderContainerView()
            .safeAreaPadding(.top, 54)
    }
}

// iOS 16+ 공통 기본 코어 지원
@available(iOS 16.0, *)
struct CoreCameraAppView: View {
    @StateObject var viewModel = CameraViewModel()
    // ...
}
```

---

## 5. 검증 및 테스트 방법

### 1) 데스크톱 프로토타입 인터랙티브 전환
- 좌측 사이드바의 **`📱 iPhone 기기 뷰포트 프리뷰`** 섹션에서 원하는 기기 버튼 클릭:
  - `iPhone 15/16 Pro` (393 × 852)
  - `15/16 Pro Max` (430 × 932)
  - `iPhone 13 mini` (375 × 812)
  - `iPhone SE 2/3` (375 × 667)
- 기기 프레임 크기, 노치/아일랜드 유무, 라운드 코너, 뷰파인더 비율이 실시간으로 1초 만에 전환됩니다.

### 2) 실제 아이폰 Safari에서 직접 접속
- 동일 Wi-Fi에 연결된 아이폰으로 접속:
  - `http://<PC의 로컬IP>:8080/index.html`
- Safari의 [공유] ➜ [홈 화면에 추가] 클릭 시 완벽한 풀스크린 네이티브 앱 형태로 실행됩니다.
