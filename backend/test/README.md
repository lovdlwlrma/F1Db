# Backend Tests

本目錄包含後端的所有測試文件。

## 目錄結構

```
test/
├── mocks/                    # Mock 實現
│   ├── mocks.go             # Mock 包初始化
│   ├── mock_transporter.go  # Transporter 接口的 mock
│   ├── Makefile            # Mock 生成管理
│   └── README.md           # Mock 使用指南
├── transporter/             # Transporter 層測試
│   ├── transporter_test.go  # 主要測試文件
│   └── service_example_test.go # 服務層示例測試
└── README.md               # 本文件
```

## 運行測試

### 運行所有測試

```bash
go test ./test/... -v
```

### 運行特定測試

```bash
# 運行 transporter 測試
go test ./test/transporter/... -v

# 運行 mock 測試
go test ./test/mocks/... -v
```

### 運行測試並生成覆蓋率報告

```bash
go test ./test/... -v -cover
```

## 測試覆蓋率

```bash
# 生成覆蓋率報告
go test ./test/... -coverprofile=coverage.out

# 查看覆蓋率報告
go tool cover -html=coverage.out
```

## Mock 管理

### 生成 Mock

```bash
cd test/mocks
make generate
```

### 重新生成 Mock

```bash
cd test/mocks
make regenerate
```

## 測試最佳實踐

1. **使用 Mock**：對於外部依賴，使用 mock 進行測試
2. **測試覆蓋率**：保持高測試覆蓋率
3. **測試命名**：使用描述性的測試函數名稱
4. **錯誤測試**：確保測試錯誤情況
5. **邊界測試**：測試邊界條件和極端情況

## 測試類型

### 單元測試

- 測試單個函數或方法
- 使用 mock 隔離依賴
- 快速執行

### 集成測試

- 測試多個組件之間的交互
- 可能需要真實的依賴
- 執行時間較長

### 端到端測試

- 測試完整的用戶流程
- 使用真實的數據庫和服務
- 最慢但最全面

## 持續集成

測試會在 CI/CD 流程中自動運行，確保代碼質量。


