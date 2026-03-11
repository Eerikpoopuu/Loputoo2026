

# 🌸 Lillede Tellimusteenus – Maandumisleht & Tellimisvorm

## Ülevaade
Roosa-lilla teemaline lillede tellimuse veebileht eesti keeles. Koosneb ilusast maandumislehest koos kimbuvalikutega ja tellimisvormist, mis saadab andmed Django API-le.

---

## 1. Visuaalne teema
- **Värviskeem**: roosa-lilla gradient taust, valged kaardid, lilla aktsendid
- **Font**: puhas ja elegantne
- **Üldine stiil**: pehme, õhuline, lilledele sobiv

---

## 2. Maandumisleht (Landing Page)
- **Kangelassektsioon (Hero)**: suur pealkiri eesti keeles (nt "Värsked lilled iga nädal"), lühike kirjeldus ja CTA-nupp "Telli kohe"
- **Kimbuvalikud**: 3 kaarti – Väike, Keskmine ja Suur kimbu, igaühe peal illustratiivne placeholder-pilt, kohatäitja-hinnad ja lühikirjeldus
- **Perioodiinfo**: selgitus iganädalase ja igakuise tellimuse kohta
- **CTA sektsioon**: nupp tellimisvormile liikumiseks

---

## 3. Tellimisvorm
- **Väljad**: Nimi, E-post, Telefon, Tarneaadress
- **Valikud**: Kimbu suurus (Väike / Keskmine / Suur), Periood (Iganädalane / Igakuine)
- **Validatsioon**: kohustuslikud väljad, e-posti formaadi kontroll
- **Esitamine**: POST-päring Django API-le (URL on seadistatav)
- **Tagasiside**: edukateade pärast esitamist

---

## 4. Django API ühendus
- API baas-URL on konfigureeritav muutujana
- Vorm saadab JSON-andmed `POST /api/subscribe/` endpointi
- Vigade käsitlemine ja kasutajale kuvamine

