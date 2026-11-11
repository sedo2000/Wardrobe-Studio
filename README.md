# Wardrobe Studio

تطبيق تنسيق ملابس عربي RTL يعمل كموقع مستقل ويمكن فتحه داخل Telegram Mini App.

## المتطلبات
- Node.js 20 أو أحدث
- npm

## التشغيل محلياً
```bash
npm install
npm run dev
```
افتح الرابط الذي يعرضه Vite، غالباً `http://localhost:5173`.

## بناء نسخة الإنتاج
```bash
npm run build
npm run preview
```
ملفات النشر النهائية ستكون داخل `dist/`.

## النشر على Vercel
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Telegram Mini App
انشر الموقع على HTTPS، ثم اربط رابط النشر من إعدادات البوت في BotFather ضمن Mini App أو Menu Button. التطبيق يستدعي `Telegram.WebApp.ready()` و`expand()`، ويستخدم Haptic Feedback إن كان متاحاً، ويرسل بيانات الإطلالة عبر `sendData` عند الحفظ داخل Mini App.

## ملاحظات فنية
- المانيكان مبني في Three.js كعارض ثلاثي الأبعاد بدون ملامح وجه.
- المجسم إجرائي (procedural)، وليس نموذجاً فوتوغرامترياً؛ يمكن لاحقاً استبداله بملف GLB احترافي مرخص.
- الإطلالات تحفظ محلياً عبر localStorage. المزامنة بين الأجهزة تتطلب Backend وقاعدة بيانات.
- لا توجد حاجة إلى مفاتيح API لتشغيل النسخة الحالية.