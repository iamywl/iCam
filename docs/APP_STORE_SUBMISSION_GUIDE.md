# 🚀 SnapStudio App Store 등록 및 심사 제출 완벽 가이드
> **Complete Step-by-Step Apple App Store Submission Guide**

---

## 1. 사전 준비 단계 (Prerequisites)

### 1) Apple Developer Program 계정
- **개인(Individual) 또는 조직(Organization)** 계정 필요 (연간 \$99 USD).
- [Apple Developer 웹사이트](https://developer.apple.com/programs/)에서 등록 완료 필요.

### 2) 앱 기본 식별 정보
- **App Name**: `SnapStudio - 감성 필름 & 프로필 카메라`
- **Bundle Identifier**: `com.snapstudio.icam`
- **SKU (고유 식별자)**: `SNAPSTUDIO_IOS_001`
- **Primary Language**: 한국어 (Korean)

---

## 2. App Store Connect 앱 생성 (5단계)

1. **App Store Connect 접속**:
   - [appstoreconnect.apple.com](https://appstoreconnect.apple.com)에 Apple ID로 로그인.
2. **앱 추가**:
   - [나의 앱] ➜ `+` 버튼 클릭 ➜ **[신규 앱]** 선택.
3. **신규 앱 양식 입력**:
   - **플랫폼**: `iOS` 체크
   - **이름**: `SnapStudio - 감성 필름 & 프로필 카메라`
   - **기본 언어**: `한국어`
   - **번들 ID**: 등록된 `com.snapstudio.icam` 선택 (미등록 시 Developer Portal에서 `App IDs` 생성)
   - **SKU**: `SNAPSTUDIO_IOS_001`
   - **사용자 액세스 권한**: `전체 액세스 권한`
4. **[생성]** 클릭.

---

## 3. 필수 메타데이터 입력 (App Information & Version)

> 💡 **복사-붙여넣기 전용 메타데이터 텍스트는 [APP_STORE_METADATA_COPYPASTE.md](file:///c:/Users/SSAFY/Desktop/icam/docs/APP_STORE_METADATA_COPYPASTE.md)에 모두 정리되어 있습니다.**

### 1) 앱 정보 (App Information)
- **카테고리**:
  - 기본(Primary): **사진 및 비디오 (Photos & Videos)**
  - 보조(Secondary): **라이프스타일 (Lifestyle)**
- **콘텐츠 권한**: 제3자 콘텐츠 이용 권한에 대한 서약 체크 (자체 개발 에셋).
- **연령 등급(Age Rating)**: 설문 작성 ➜ 모든 항목 "없음" 체크 ➜ **4+ (만 4세 이상)** 자동 산정.

### 2) 버전 정보 (iOS Version 1.0.0)
- **스크린샷 업로드**:
  - **6.9형 디스플레이 (iPhone 16 Pro Max)**: `1320 × 2868 px` 또는 `1290 × 2796 px` (최소 3장 이상)
  - **6.7형 / 6.5형 디스플레이 (iPhone 15 Pro Max / 14 Plus)**: `1290 × 2796 px`
  - *(팁: 본 프로젝트의 `qa_viewport_max.png`, `qa_viewport_standard.png`를 기반으로 목업 프레임을 입혀 업로드 가능)*
- **홍보 문구 (Promotional Text)**: 복사-붙여넣기 템플릿 사용.
- **설명 (Description)**: 16종 카메라와 광학 렌즈, 시현하다 프로필, 여권 사진 시트 설명 기재.
- **키워드 (Keywords)**: 100자 이내 쉼표 구분 키워드 입력.
- **지원 URL (Support URL)** 및 **마케팅 URL (Marketing URL)** 입력.

### 3) 앱 심사 정보 (App Review Information)
- **로그인 불필요**: "로그인이 필요하지 않습니다" 체크.
- **연락처 정보**: 본인의 성명, 이메일, 전화번호(국가번호 +82 포함).
- **심사 메모 (Review Notes)**:
  > "SnapStudio는 별도의 계정 가입이나 인터넷 연결 없이 오프라인에서도 모든 카메라 필터와 촬영 기능을 100% 체험할 수 있는 올인원 카메라 앱입니다. 심사 시 16종 카메라 모드 탭 및 셔터 버튼을 누르시면 즉시 모든 필터 효과와 갤러리 저장을 테스트하실 수 있습니다."

---

## 4. 빌드 업로드 & TestFlight 검증

### 방법 A: GitHub Actions 자동 빌드 (.ipa / TestFlight)
1. 리포지토리의 `.github/workflows/build-ipa.yml`이 메인 브랜치 푸시 시 자동 실행됩니다.
2. App Store Connect API Key(`APPSTORE_KEY_ID`, `APPSTORE_ISSUER_ID`, `APPSTORE_PRIVATE_KEY`)를 GitHub Secrets에 등록하면 TestFlight로 자동 업로드됩니다.

### 방법 B: Mac / Xcode에서 직접 업로드
1. Mac에서 터미널 열기:
   ```bash
   cd icam
   xcodegen generate   # Xcode 프로젝트 재생성
   open iCam.xcodeproj
   ```
2. Xcode 상단 기기 선택기를 **`Any iOS Device (arm64)`**로 변경.
3. 메뉴: **[Product] ➜ [Archive]**.
4. 아카이브 완료 후 Organizer 창에서 **[Distribute App]** ➜ **[App Store Connect]** ➜ **[Upload]** 클릭.
5. 업로드 완료 후 App Store Connect의 [TestFlight] 탭에서 약 5~10분 후 "처리 완료" 상태가 됩니다.

---

## 5. 수출 규정 준수 (Export Compliance) 질문 답변

빌드 업로드 후 항상 물어보는 표준 질문입니다:
- **질문**: "앱에서 표준 암호화를 사용합니까?" (Does your app use encryption?)
- **답변**: **`아니요(No)`** 선택!
  *(팁: `Info.plist`에 `<key>ITSAppUsesNonExemptEncryption</key><false/>`가 이미 적용되어 있어 다음 빌드부터는 자동으로 건너뜁니다.)*

---

## 6. 심사 제출 및 출시 (Submit for Review)

1. [버전 1.0.0 준비 중] 화면의 **[빌드]** 섹션에서 방금 업로드된 빌드 선택.
2. 우측 상단의 **[심사 제출(Submit for Review)]** 버튼 클릭.
3. 제출 후 상태:
   - `Waiting for Review (심사 대기)`: 보통 12~24시간 소요.
   - `In Review (심사 중)`: 보통 2~6시간 소요.
   - `Pending Developer Release (출시 대기)` 또는 `Ready for Sale (판매 준비됨)`: 심사 통과 완료!
