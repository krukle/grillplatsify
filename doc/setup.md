# Setup

- Klona [projektet](https://gitlab.lnu.se/1dt308/student/team-5).

## The Things Network (TTN)

- Skapa ett konto på [TTN's hemsida](https://www.thethingsnetwork.org/).
- Skapa en applikation och registrera din pycom-enhet.
- För att registrera din pycom-enhet behöver du ditt `Device EUI`. Det får du genom att köra följande kod på din pycom-enhet:

```python
from network import LoRa
import ubinascii

lora = LoRa()
print("DevEUI: %s" % (ubinascii.hexlify(lora.mac()).decode('ascii')))
```

- När enheten är tillagd ändra aktiveringsmetod till `OTAA` under inställningar för enheten.
- Gå in på `Overview` för din enhet och kopiera värdena under `EXAMPLE CODE`.
- Skapa en `config.py` i `/src/pycom` som ser ut som följer:

```python
app_eui = ""
app_key = ""
```

- Klistra in värdena från `EXAMPLE CODE` mellan citatteckena.
- Nu kan du se skickade värden från enheten under `Data`

## Docker
- Installera [Docker](https://docs.docker.com/get-docker/) och  [Docker Compose](https://docs.docker.com/compose/install/) lokalt eller på din server.
- Skapa en fil som heter `.env` i webapp-mappen med följande kod:

```
COMPOSE_PROJECT_NAME=fireplace
DB=iot
DB_USER=username
DB_PASS=password
```

- Ersätt `username` och `password` med ditt användarnamn och lösenord för databasen.
- Starta servern med `docker-compose up`.
## Node-RED
- Gå in på [Node-RED](localhost:1880/) om du har installerat lokalt. Annars via IP-adressen för din server.
- I panelen till höger, klicka på kugghjulet.
- Under `On all flows`, dubbelklicka på knappen under `influxdb`.
- Ändra `username` och `password` till användarnamn och lösenord för din databas. 
- Klicka på `Update`.
- Under `On all flows`, dubbelklicka på knapppen under `mqtt-broker`.
- Sätt server till `eu.thethings.network` och port till `1883`.
- Under `security` skriver du in dina kredentialer för TTN.
- Klicka `Update`.
- Klicka på `TTN EU`-noden.
- Under `Topic` ändrar du `APP-ID` till ditt applikations-ID för TTN.
- Klicka på `Done`.

## Mapbox
- Skapa ett konto hos [Mapbox.](https://account.mapbox.com/auth/signup/)
- Logga in och gå till [https://account.mapbox.com/](https://account.mapbox.com/)
- Scrolla ner och kopiera din `access token`.
- Redigera filen `src/webapp/data/node-red/uibuilder/uibuilder/src/index.js`
- På rad 27 ersätter du `ACCESSTOKEN` med din unika `access token`.
## Pycom-kod

- Koppla in din Pycom-enhet i datorn.
- Starta `Atom` och klicka `Open Folder`.
- Välj mappen `pycom`.
- Klicka `Upload project to device`.

