# 🧠 HSD Arena – API Dokümantasyonu (MVP v1.0)

## 1. Genel Bilgi
- **Amaç:** HSD Arena quiz platformu için admin, takım ve skor işlemlerini yönetecek temel API’leri tanımlamak.  
- **Base URL:** `https://<domain>/api`  
- **Response Formatı:** `application/json`  
- **Authentication:** JWT Token (yalnızca admin işlemleri için)  
- **Versiyon:** v1.0 (MVP)  

---

## 2. AUTHENTICATION (Yönetici Girişi)

### `POST /auth/login`
Admin giriş işlemi.  
JWT token döner — bu token yönetici işlemlerinde `Authorization: Bearer <token>` başlığıyla gönderilmelidir.

#### Request
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

#### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

#### Hatalar
- `401` – Geçersiz kullanıcı adı veya şifre  
- `500` – Sunucu hatası  

---

## 3. TEAM (Takım Katılımı)

### `POST /team/join`
Takım, QR kod veya bağlantı üzerinden katılır.  
Sisteme giriş yaptığında kendisine bir `teamId` atanır.

#### Request
```json
{
  "teamName": "HSD Stars",
  "sessionCode": "GAME123"
}
```

#### Response
```json
{
  "teamId": "T001",
  "message": "Takım başarıyla katıldı."
}
```

#### Hatalar
- `400` – Eksik bilgi veya geçersiz session kodu  
- `409` – Aynı isimde takım zaten var  

---

## 4. QUIZ (Yönetici Tarafı)

### `POST /quiz/create`
Yeni quiz oluşturma ve soruların yüklenmesi.

#### Request
```json
{
  "title": "Genel Kültür Yarışması",
  "questions": [
    {
      "text": "Atatürk'ün doğum yılı nedir?",
      "options": ["1879", "1881", "1889", "1901"],
      "correct": "1881"
    },
    {
      "text": "Türkiye'nin başkenti neresidir?",
      "options": ["İstanbul", "Ankara", "İzmir", "Bursa"],
      "correct": "Ankara"
    }
  ]
}
```

#### Response
```json
{
  "quizId": "Q1001",
  "message": "Quiz başarıyla oluşturuldu."
}
```

---

### `GET /quiz/:id`
Belirtilen quiz detaylarını döner.

#### Response
```json
{
  "quizId": "Q1001",
  "title": "Genel Kültür Yarışması",
  "questions": [
    {
      "questionId": "Q1",
      "text": "Atatürk'ün doğum yılı nedir?",
      "options": ["1879", "1881", "1889", "1901"]
    }
  ]
}
```

---

## 5. ANSWERS (Cevap Gönderimi)

### `POST /answer`
Takımın bir soruya verdiği cevabı gönderir.

#### Request
```json
{
  "teamId": "T001",
  "quizId": "Q1001",
  "questionId": "Q1",
  "answer": "1881"
}
```

#### Response
```json
{
  "isCorrect": true,
  "earnedPoints": 10,
  "totalScore": 30
}
```

---

## 6. SCOREBOARD (Liderlik Tablosu)

### `GET /scoreboard/:sessionCode`
Belirli bir oturumdaki takımların güncel puan durumunu döner.

#### Response
```json
{
  "sessionCode": "GAME123",
  "leaderboard": [
    { "teamName": "HSD Stars", "score": 40 },
    { "teamName": "Code Ninjas", "score": 30 }
  ]
}
```

---

## 7. REALTIME EVENTS (WebSocket Kanalı)
Canlı soru-cevap akışı ve skor güncellemeleri bu kanaldan yürütülür.  
Bağlantı: `wss://<domain>/realtime`

| **Event** | **Yön** | **Açıklama** |
|------------|----------|---------------|
| `question_start` | Server → Client | Yeni soru başladığında gönderilir |
| `answer_submit` | Client → Server | Takım cevabı gönderir |
| `score_update` | Server → Client | Güncel skorlar yayınlanır |
| `quiz_end` | Server → Client | Yarışma tamamlandığında bildirim gider |

#### Örnek Event
```json
{
  "event": "score_update",
  "data": {
    "leaderboard": [
      { "teamName": "Team One", "score": 50 },
      { "teamName": "Team Two", "score": 45 }
    ]
  }
}
```

---

## 8. Hata Kodları

| **Kod** | **Anlamı** |
|----------|-------------|
| `200` | Başarılı işlem |
| `400` | Eksik veya hatalı parametre |
| `401` | Yetkisiz erişim |
| `404` | Kaynak bulunamadı |
| `500` | Sunucu hatası |

---

## 9. Genel Akış Özeti

1. Admin → `/auth/login` ile oturum açar.  
2. Admin → `/quiz/create` ile soruları yükler.  
3. Sistem → QR kod üretir (`sessionCode` oluşturur).  
4. Takımlar → `/team/join` ile katılır.  
5. Admin → soruları başlatır (WebSocket event: `question_start`).  
6. Takımlar → `/answer` endpoint’i üzerinden cevaplarını gönderir.  
7. Backend → doğru/yanlış kontrol eder, puan hesaplar.  
8. Sistem → `score_update` event’iyle herkese skorları yollar.  
9. Tüm sorular bitince → `quiz_end` event’i gönderilir, lider tablosu final olur.

---

## 🔧 Notlar (MVP İçin)
- Authentication sadece admin tarafında zorunludur.  
- Team endpoint’leri JWT istemez.  
- Quiz & skor hesaplama backend’de yapılır.  
- WebSocket kanalında canlı iletişim kurulması MVP’nin önemli parçasıdır.  
- Domain, cloud ortamına karar verildikten sonra `.env` dosyasında belirlenecektir.  

---

Bu doküman, ekibin geliştirmeye başlarken izleyeceği referans API yapısını temsil eder.  
İlerleyen sürümlerde endpoint detayları (ör. `PUT /quiz/update`, `DELETE /team/leave`) eklenecek şekilde genişletilebilir.
