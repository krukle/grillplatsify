# Test


## Rörelsesensorn

Rörelsesensorn ser i en kon på 110 grader och 7 meter framför sig. När någon eller något rör sig framför den. ska den väcka pycomen. 

Testning av rörelsesensorn sker genom att röra sig framför sensorn på olika distans och se om den aktiveras. Målet är att rörelsesensorn ska nå åtminsonde 5 meter.

Vi testar att röra oss framför rörelsesensorn på olika distans:

| Avstånd | Precision | 
|---------|-----------|
| 1m | 30/30 |
| 2m | 30/30 |
| 3m | 28/30 |
| 4m | 29/30 |
| 5m | 26/30 |
| 6m | 13/30 |
| 7m | 0/30 |

Vi ser att rörelsesensorn fungerar bra upp till 5 m avstånd. 

## LoRa

Boreoende på om det finns människor i närheten eller inte skickar pycomen sitt svar till servern med LoRa.

LoRa testas genom att skicka olika värden från pycomen och se så att alla kommer fram. 

De olika värdena defineras på följande sätt:

```python
s.send(bytes([0x00))
s.send(bytes([0x01))
s.send(bytes([0x02))
```

Där första värdet är 0, andra är 1 och tredje är 2.

När enheten inte ser någon rörelse, skickas en nolla.

När enheten ser rörelse och wifi-enheter skickas en etta.

När enheten ser rörelse men inga wifi-enheter skickas en tvåa. 

Oavsett värde vi skickar får vi rätt värde på servern. 

Vi vill också att enheten ska ha bra täckning där den sitter. 

Vi begav oss till Svinö och testade täckning. 

När vi stod under bar himmel lyckades vi koppla till LoRa och skicka värden väldigt fort. 

När vi placerade pycomen under vindskydd med plåttak tog det längre tid med både uppkoppling och sändning. 

Men, det fungerade alltid, de två dygn den satt där. Så det var helt klart godkänt. 

## Wifi Sniffer

När rörelse sker söker wifi-sniffern efter enheter med wifi i närheten (läs; människor). Beroende av huruvida den hittar människor i närheten eller ej skickas olika svar till servern. 

För att testa wifi sniffern kör vi följande kod:

```python
from network import WLAN
import ubinascii


def pack_cb(pack):
    mac = bytearray(6)
    pk = wlan.wifi_packet()
    control = pk.data[0]
    subtype = (0xF0 & control) >> 4
    type = 0x0C & control
    if subtype == 4:
        for i in range (0,6):
            mac[i] = pk.data[10 + i]
        print ("Wifi Node with MAC: {}".format(ubinascii.hexlify(mac)))

wlan = WLAN(mode=WLAN.STA, antenna=WLAN.EXT_ANT)
wlan.callback(trigger=WLAN.EVENT_PKT_MGMT, handler=pack_cb)
wlan.promiscuous(True)
```

Denna kod söker efter wifi-enheter konstant, och om den hittar dem, printar den dess mac-adresser. 

Vi testar den och den hittar våra telefoner. När vi stänger av vårt wifi på telefonerna, hittar den dem inte. Vi hittar även okända enheter runtomkring, men det är att vänta med tanke på att vi bor i lägenhet. 

I projektet är vi inte beroende av att veta hur många enheter som är runt pycomen utan endast OM det finns enheter. Vi använder därför en simplifierad version i vår faktiska kod. 

## Batteri

Pycomen drivs av en powerbank på 30 000 mAh. 

Vi körde vårt program i fyra dagar och brände mindre än 25% av batteriet på powerbanken. Vi räknar därför med att enheten kan köras i minst 16 dygn. utan att behöva laddas upp. 

Vidare testning kan utföras med en elmätare för att se exakt vad pycomen drar i viloläge, respektive körläge. Och på den vägen räkna ut ungefärlig batteritid vid snittförbrukning. 

## Hemsida

Hemsidan ska visa den senaste statusen för de olika pycomsen. InfluxDB ska spara ner all data för pycomsen.

Eftersom att vi har som mål att sätta upp många pycoms på många grillpaltser efter projektets gång vill vi att vår hemsida och databas ska klara av att få mycket olika värden skickat till sig samtidigt. 

Vi testade detta genom att skicka en massa olika mockdata till servern, för att se hur den och hemsidan hanterade det. 

Mockdatan vi skickade var vad ni ser i koden nedan. `PYCOM` ersattes med olika enheters namn och `VÄRDE` ersattes med olika värden. Värden är då olika status på grillplatsens tillgänglighet. 

```javascript
msg.topic = "christoffereid/devices/PYCOM/up";
msg.payload = '{"dev_id":"PYCOM","payload_raw":"VÄRDE"}';
```

Sammanlagt skickades det data 1500 gånger, 120 gånger i minuten från två olika enheter. Vilket motsvarade 6 minuter och 15 sekunder. Databasen sparade alla 1500 resultat och hemsidan uppdaterade statusen för de båda grillplatserna på kartan utan problem.


## Färdiga enheten

När enheten var helt färdig testade vi den på Svinö, samt i ett vardagsrum. Tanken var att vi då kunde jämföra utmärkta inomhusförhållanden med imperfekta utomhusförhållanden. 

### Utomhus

Enheten monterades under en bänk under ett vindskydd på Svinö. Rörelsesensorn var riktad mot grillplatsen på ungefär 3m avstånd, och LoRa antennen fick en okej koppling. 

![Enhet på plats](../img/enhetpasvino.jpg)

Enheten kördes i två dygn och verkade fungera bra. Den visade ökad aktivitet under tiden solen var uppe, och sov timmarna då solen var nere. Klart förväntad aktivitet på en grillplats. Efter ett par dygn slutade pycomen skicka. Detta tydde på att något var fel då vi hade hårdkodat enheten att även utan aktivitet på grillplats åtminstone en gång om dygnet vakna och skicka sin status.

![Svinö grillplats](../img/svino.png)

### Inomhus

Enheten monterades på en tv-bänk i ett vardagsrum. Rörelsesensorn riktad mot en soffa, som stod ungefär 3m bort. Alltså liknande förhållanden som Svinö, minus de opålitliga väderförhållandena. 

Här kunde aktiviteten granskas mycket mer nogrant då vi var säkra på vilken aktivitet som faktiskt skedde på plats. Under timmarna hushållet var borta, sov enheten gott. När kvällarna spenderades i soffan visade enheten på det, och under dagarna kom blandad status då hushållet rörde sig stokastiskt i huset. 

Efter ett par dygns körtid slutade även denna enhet köra. 

### Bugget

Kollar man på vår kod och testkör enheterna i någon stund kan de verka felfria. De fungerar precis somm vi hade hoppats på, alla meddelanden kommer fram till `TTN` och hemsidan uppdateras blixtsnabbt. Men, efter en längre tids körning uppstår alltid ett och samma fel. Enheten vaknar utan förklarlig anledning från deepsleep, visar nedanstående meddelande i terminalen, kraschar, rinse and repeat, tills man drar elen. 

```python
rst:0x7 (TG0WDT_SYS_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0018,len:4
load:0xbfff009c,len:1228
load:0x3f720080,len:1073782456
ets Jun 8 2016 00:22:57
```

Att enheten stöter på ett bugg hade såklart inte gjort någonting, om det var så att man kunde fånga det med en error handler. Då hade vi bara kunnat köra en `machine.reset()` och så var vi på banan igen. Problemet med detta bugg är att det sker innan enheten har kommit in i `boot.py` eller `main.py`. Vilket gör det hela så extremt mycket mer problematiskt. 

Vi har sett liknande fel diksuteras i PyComs issues-forum, men tyvärr inga identiska med vårt. Vi har testat flasha om enheten med en massa olika firmware, till och med en del experimentella. Tyvärr utan resultat. 

Vi har skickat in ett issue till PyCom och hoppas på ett svar. Det vore kul, om ändå efter kursens slut, om vi fick allting att funka och kunde erbjuda tjänsten till Kalmar och Nybro kommun, som har visat intresse. 