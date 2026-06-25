# Fonts Folder / Thu muc fonts

EN: Keep this file so the `fonts` folder can be committed to Git even when no font files are included.

VI: Giu file nay de thu muc `fonts` van co the duoc commit len Git, ngay ca khi khong co file font nao ben trong.

Suggested structure / Cau truc goi y:

- `InstalledFonts/`: EN: fonts installed by the current user. VI: font do nguoi dung cai them tren may.
- `SystemDefaultFonts/`: EN: copied system default fonts. VI: ban copy cua cac font mac dinh he thong.

EN: After adding, removing, or moving font files, regenerate `fonts-manifest.js` and `fonts-manifest.json` so the app can load the current font list.

VI: Sau khi them, xoa, hoac di chuyen file font, hay tao lai `fonts-manifest.js` va `fonts-manifest.json` de app load dung danh sach font hien tai.
