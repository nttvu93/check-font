# Font Check

Trang local để preview nhanh các file font `.ttf`, `.otf`, `.ttc`, `.dfont`, `.woff`, `.woff2`.

## Cách dùng

1. Mở `index.html` trực tiếp, hoặc chạy server local trong thư mục này:

```bash
python3 -m http.server 8000
```

2. Nếu chạy server, mở `http://localhost:8000`.
3. Bấm `Load fonts/` để nạp toàn bộ font đã copy sẵn, hoặc chọn/kéo thả folder chứa font vào vùng chọn font.
4. Nhập câu test, chỉnh size/weight/style và lọc theo tên font.

Font chỉ được load trong trình duyệt trên máy của bạn, không upload đi đâu.

## Nên đặt font ở đâu?

Bạn nên để app ở thư mục này và để font trong thư mục con `fonts/`.

Ví dụ:

```text
check/
  index.html
  app.js
  styles.css
  fonts/
    MyFont-Regular.ttf
    MyFont-Bold.otf
```

Khi cần xem font, mở trang rồi chọn folder `fonts/`.
