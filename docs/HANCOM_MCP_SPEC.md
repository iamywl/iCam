# 📄 Hancom Office Model Context Protocol (MCP) Server Specification
> **문서 버전**: v1.0.0  
> **프로젝트 목표**: 한글과컴퓨터(HWP/HWPX)의 모든 문서 처리 기능을 LLM이 직접 호출할 수 있도록 표준 MCP(Model Context Protocol) 도구로 제공

---

## 1. 개요 및 비전
본 MCP 서버는 공공기관, 금융권, 대기업의 표준 포맷인 **HWP(한글 5.0 바이너리) 및 HWPX(KS X 6101 개방형 표준)** 문서를 인공지능 에이전트가 완벽히 분석, 편집, 자동 생성, 변환할 수 있도록 지원하는 고성능 MCP 백엔드입니다.

`/Users/ywlee/sideproejct/hanul-hwpx` 코어 엔진과의 긴밀한 연동을 통해 별도의 한글 오피스 설치 없이도(Headless/Cross-platform) 고속으로 문서를 조작합니다.

---

## 2. MCP Tool 카탈로그 (전체 기능 매트릭스)

### 2.1 문서 읽기 및 분석 (`Document Inspection Tools`)
| 도구명 | 파라미터 | 설명 |
| :--- | :--- | :--- |
| `hancom_read_text` | `filePath: string`, `includeHeaders?: boolean` | 문서 내 전체 본문 텍스트 및 문단 계층 추출 |
| `hancom_get_structure` | `filePath: string` | 섹션, 페이지, 문단, 표, 이미지 메타데이터 트리 반환 |
| `hancom_extract_tables` | `filePath: string`, `tableIndex?: number` | 표(Table) 구조를 2D 배열 및 Markdown/JSON 형식으로 추출 |
| `hancom_extract_images` | `filePath: string`, `outputDir: string` | 문서 내 임베딩된 이미지 바이너리 일괄 추출 |

### 2.2 문서 작성 및 편집 (`Document Editing Tools`)
| 도구명 | 파라미터 | 설명 |
| :--- | :--- | :--- |
| `hancom_create_document` | `outputPath: string`, `template?: string` | 신규 공문서/보고서 템플릿 기반 HWPX 생성 |
| `hancom_append_paragraph` | `filePath: string`, `text: string`, `style?: ParagraphStyle` | 제목, 본문, 글머리 기호 문단 추가 |
| `hancom_insert_table` | `filePath: string`, `rows: number`, `cols: number`, `data: any[][]` | 지정된 위치에 스타일화된 표 삽입 및 데이터 바인딩 |
| `hancom_fill_template` | `templatePath: string`, `outputPath: string`, `variables: Record<string, string>` | 공문서 양식 내 `{{누락필드}}` 변수 일괄 치환 |

### 2.3 포맷 변환 (`Conversion Tools`)
| 도구명 | 파라미터 | 설명 |
| :--- | :--- | :--- |
| `hancom_to_markdown` | `filePath: string` | HWP/HWPX 문서를 구조화된 GitHub 마크다운으로 변환 |
| `hancom_to_pdf` | `filePath: string`, `outputPath: string` | PDF 고충실도 내보내기 |
| `hancom_hwp_to_hwpx` | `hwpPath: string`, `hwpxPath: string` | 레거시 바이너리 HWP를 표준 HWPX로 자동 변환 |

---

## 3. 개발 로드맵 & 아키텍처
1. **1단계**: `hanul-hwpx` 기반 HWPX 파서/빌더 라이브러리 랩핑
2. **2단계**: Model Context Protocol TypeScript SDK (`@modelcontextprotocol/sdk`) 연동
3. **3단계**: Mac/Linux 환경 Headless 단위 검증 및 CI/CD 워크플로우 구성
