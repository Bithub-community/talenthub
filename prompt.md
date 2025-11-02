### Uygulama Özeti
İş başvurusu yönetimi için Next.js (React) tabanlı bir “main-app” ve JWT üreten bir “auth-service”ten oluşan, davet ve yetki token’larıyla çalışan güvenli bir platform.

### Roller
- Super-user: Tüm işlemleri yapar, davet oluşturur, logları görüntüler.
- Yetkili kullanıcı: Tanımlı sektör ve filtrelerle başvuru oluşturur/günceller, yetkisi kadar başvuruları görür.

### Ana Akışlar
1) Davet Oluşturma (Super-user)
- Başvuru daveti: Adayın kayıt/başvuru yapması için.
- İnceleme daveti: Belirli filtreler ve zaman sınırı ile adayları görüntüleme yetkisi.
- Davet oluşturulunca auth-service bir JWT üretir; link: {host}/invite-init/{jwt-hash}
- invite-init çağrılınca DB’deki token kullanıcıya aktarılır; sonraki sayfalarda bu JWT ile yetkilendirme yapılır.

2) Başvuru Oluşturma ve Güncelleme (Yetkili Kullanıcı)
- Sektör ve temel filtreleri seçer.
- CV, motivasyon mektubu ve ek belgeler yükler.
- İletişim ve kişisel bilgilerini ekler.
- Kendi bilgilerini süresiz güncelleyebilir.

3) Başvuruları Görüntüleme (Yetkili Kullanıcı)
- Token’daki okuma izinleri ve filtre kapsamı kadar arama yapar ve sonuçları görür.

4) Denetim Kayıtları
- Tüm kullanıcı hareketleri audit log’a yazılır.
- Super-user bu logları filtreleyerek görüntüler.
- Detay sayfası açıldığında reviews’e bir satır ve audit_logs’a ACTION=APPLICATION_VIEW yazılır.

5) register-invite yetkisi olan kullanıcılar için bildirim:
  - Bir application’ı bir reviewer görüntülediğinde (reviews kaydı veya arama detay görüntülemesi):
    - applications.user_id sahibi bulunur.
    - Sahip kullanıcının en son aktif token’ında veya sistem kayıtlarında register-invite yetkisi var mı kontrol edilir (uygulama düzeyi policy).
    - Varsa notifications tablosuna application_viewed türünde bir kayıt eklenir.
    - notifications’a bir satır eklenir: title/body’de “Başvurunuz X tarafından görüntülendi” bilgisi, metadata’da application_id ve reviewer_user_id tutulur.

### Yetki ve Token Modeli
- Token: auth-service (private key) ile imzalar, main-app (public key) doğrular.
- Scope’lar:
  - id: Kullanıcı ID (kendi bilgilerini güncelleme)
  - user-name: İsim_Soyisim (davet sırasında belirlenir)
  - filter-list: Cinsiyet, lokasyon, sektör vb. tüm filtreler (“sector1 sector2 male female Antwerpen …”)
  - register-invite: Kayıt/başvuru oluşturma yetkisi
  - view-invite: Başvuru görüntüleme yetkisi
- İnceleme davetlerinde ayrıca zaman sınırı (exp) ve görünürlük filtreleri token’a işlenir.
- user-list scope:
  - Davetleri listeleme (INVITE_LIST).
  - Kullanıcı auditlerini görüntüleme (USER_AUDIT_VIEW) — audit_logs üzerinden sorgu; her görüntülemede user_audit_views kaydı eklenir ve audit_logs’a bir kayıt yazılır.


### Güvenlik ve Erişim
- JWT doğrulama: main-app public key ile.
- Linklerde JWT hash’i kullanılır; gerçek token sunucu tarafında eşleştirilip kullanıcıya iletilir.
- Okuma/yazma izinleri scope ve filtre-list ile sınırlandırılır.
- Dosya yüklemelerinde tip/size kontrolü, antivirüs taraması ve imzalı URL kullanımı.
- Audit log: kullanıcı, işlem tipi, zaman, hedef kayıt, IP/UA.

### Ekranlar (Main-App)
- Davet Karşılama: invite-init linki ile token alma, hesap/kayıt başlatma.
- Başvuru Formu:
  - Kişisel/iletişim bilgileri
  - Sektör seçimi (çoklu)
  - Filtreler (lokasyon, cinsiyet vb.)
  - Belgeler: CV, motivasyon mektubu, ek dosyalar
  - Kaydet/Güncelle
- Başvuru Arama ve Listeleme:
  - Filtrelere göre arama (scope ile sınırlı)
  - Sonuç listesi ve detay görünümü
- Yönetim (Super-user):
  - Davet oluşturma (başvuru ve inceleme daveti, filtre ve zaman sınırı)
  - Audit log görüntüleme/filtreleme

### Servisler ve Sınırlar
- main-app (Next.js/React)
  - UI, form validasyon, dosya yükleme, arama ve sonuçlar
  - JWT verify, yetki kontrolü, audit log yazımı
- auth-service
  - Sadece JWT üretir (private key ile)
  - Davet için token üretimi; süre, scope, filtreleri ekler
- DB 
    - Postgresql 18
- Predefined Sektörler
  - Information Technology (IT)
  - Finance and Banking
  - Healthcare
  - Manufacturing
  - Retail and E-commerce
  - Construction and Real Estate
  - Transportation and Logistics
  - Energy and Utilities
  - Telecommunications
  - Education and Training
  - Hospitality and Tourism
  - Media and Entertainment
  - Agriculture and Food Production
  - Legal and Professional Services
  - Government and Public Administration
  - Nonprofit and NGOs
  - Aerospace and Defense
  - Chemicals and Materials
  - Environmental and Sustainability Services
  - Human Resources and Recruitment

### Teknik Notlar
- Token alanları: sub (id), name (user-name), scope[], filter-list[], iat, exp (inceleme davetlerinde zorunlu).
- Arama sonuçları, filter-list kesişimine göre kısıtlanır.
- Audit log PII koruması: hassas alanlar maskeleme.
- Hata durumları: süresi geçmiş token, yetki dışı erişim, eksik belge, geçersiz dosya tipi.