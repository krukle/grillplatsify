from machine import Pin
import machine
from network import LoRa
from network import WLAN
import socket
import time
import ubinascii
import config
import pycom


# Deactivate LED
pycom.heartbeat(False)


# Variables
pin_str         = 'P18'
pir             = Pin(pin_str,mode=Pin.IN, pull=None)
device_found    = False
wlan            = WLAN(mode=WLAN.STA, antenna=WLAN.EXT_ANT)
lora            = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)
app_eui         = ubinascii.unhexlify(config.app_eui)
app_key         = ubinascii.unhexlify(config.app_key)
s               = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
# 1 if interrupted by PIR, 2 if timeout
wake_reason     = machine.wake_reason()[0]
# True if motion's been detected. False if not.
high            = True if machine.wake_reason()[1] != [] else False


# Function for wifi-sniffer
def pack_cb(pack):
    global device_found
    pk = wlan.wifi_packet()
    control = pk.data[0]
    subtype = (0xF0 & control) >> 4
    #print("Control:{}, subtype:{}, type:{}".format(control, subtype, type))
    if subtype == 4:
        device_found = True


# Wifi-sniffer
wlan.callback(trigger=WLAN.EVENT_PKT_MGMT, handler=pack_cb)
wlan.promiscuous(True)


# Join LoRa
lora.join(activation=LoRa.OTAA, auth=(app_eui, app_key), timeout=0)


# Wait for the module to join the LoRa-network.
while not lora.has_joined():
    time.sleep(2.5)


# Set the LoRaWAN data rate and setblocking
s.setsockopt(socket.SOL_LORA, socket.SO_DR, 0)
s.setblocking(True)


# If awoken by PIR interrupt.
if wake_reason == 1:
    # If no motion is detected.
    if not high:
        s.send(bytes([0x00]))
        machine.pin_sleep_wakeup([pir], mode=machine.WAKEUP_ANY_HIGH)
        machine.deepsleep(86400000)
    # If wifi units are nearby
    elif device_found:
        s.send(bytes([0x01]))
    # If motion is detected and no wifi units are nearby.
    else:
        s.send(bytes([0x02]))
    # Go to sleep for 15 minutes. Interrupts if no motion's detected.
    machine.pin_sleep_wakeup([pir], mode=machine.WAKEUP_ALL_LOW)
    machine.deepsleep(900000)
# Go to sleep for 24 hours.
machine.pin_sleep_wakeup([pir], mode=machine.WAKEUP_ANY_HIGH)
machine.deepsleep(86400000)
