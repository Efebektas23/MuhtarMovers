# 🔒 SSL Sertifikası Kurulum Rehberi

## ⚡ Hızlı Çözüm: Cloudflare (5 Dakika)

### Adım 1: Cloudflare Hesabı
1. https://www.cloudflare.com/ → "Sign Up" 
2. Email ve şifre ile hesap oluşturun

### Adım 2: Domain Ekleme
1. "Add a Site" butonuna tıklayın
2. `muhtar.ca` yazın → "Add Site"
3. "Free" planı seçin
4. Aynı işlemi `muhtar.us` için tekrarlayın

### Adım 3: DNS Kayıtları
Cloudflare otomatik DNS kayıtlarını tarayacak:
- ✅ A record: muhtar.ca → IP adresiniz
- ✅ A record: www.muhtar.ca → IP adresiniz
- ✅ A record: muhtar.us → IP adresiniz  
- ✅ A record: www.muhtar.us → IP adresiniz

### Adım 4: Name Server Değişikliği
Cloudflare size 2 name server verecek (örnek):
```
alex.ns.cloudflare.com
beth.ns.cloudflare.com
```

Bu name serverları domain kontrol panelinizde güncelleyin:
- Domain sağlayıcınıza giriş yapın (GoDaddy, Namecheap, vs.)
- DNS/Name Server ayarlarını bulun
- Cloudflare'in verdiği name serverları ekleyin

### Adım 5: SSL Ayarları
1. Cloudflare dashboard → SSL/TLS
2. "Full" seçeneğini seçin
3. "Always Use HTTPS" açın
4. "Automatic HTTPS Rewrites" açın

### Adım 6: Bekleyin (24 saat)
- Name server değişikliği 24 saate kadar sürebilir
- SSL sertifikası aktif olduğunda https://muhtar.ca çalışacak

## 🏢 Hosting Sağlayıcısı SSL'i

### cPanel Kullanıyorsanız:
1. cPanel'e giriş yapın
2. "SSL/TLS" bölümünü bulun
3. "Let's Encrypt" veya "AutoSSL" açın
4. Domain'lerinizi seçin ve aktifleştirin

### Popüler Hosting Firmaları:

#### GoDaddy:
- Hosting kontrol paneli → SSL Certificates
- "Create New Certificate" → Let's Encrypt
- Domain seçin → "Create"

#### Bluehost:
- cPanel → SSL/TLS → "Let's Encrypt"
- Domain seçin → "Install"

#### SiteGround:
- Site Tools → Security → SSL Manager
- "Get" butonuna tıklayın

#### Hostinger:
- hPanel → SSL → "Order SSL Certificate"
- "Free SSL" seçin

## 🔧 Google Maps API için SSL Gerekliliği

Google Maps API HTTPS gerektiriyor! SSL olmadan:
- ❌ Autocomplete çalışmaz
- ❌ Maps yüklenmez  
- ❌ API çağrıları başarısız olur

SSL sonrası:
- ✅ Tüm özellikler çalışır
- ✅ Güvenlik uyarıları kalkar
- ✅ SEO artışı

## 🚨 Acil Geçici Çözüm

SSL beklerken geçici test için:

### Mixed Content Sorunu
Eğer site HTTP ama Google Maps HTTPS istiyorsa, şu kodu ekleyin:

```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

Bu kod HTTP'yi otomatik HTTPS'e çevirir.

## ✅ SSL Doğrulama

SSL kurulumu sonrası test edin:
1. https://muhtar.ca → Güvenlik simgesi görünmeli
2. https://www.muhtar.ca → Yönlendirme çalışmalı
3. https://muhtar.us → SSL sertifikası aktif olmalı
4. test-maps.html → Google Maps çalışmalı

## 🆘 Yardım

Hangi hosting sağlayıcısı kullanıyorsunuz?
- GoDaddy, Bluehost, SiteGround, Hostinger?
- Kendi sunucunuz mu var?
- cPanel, Plesk yoksa başka kontrol paneli?

Bu bilgileri verin, size özel adımları hazırlayalım.

---

**Önemli**: SSL olmadan Google Maps API düzgün çalışmaz! 