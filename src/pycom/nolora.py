# main.py -- put your code here!
from machine import Pin
from time import sleep
import machine
from network import LoRa
from network import WLAN
import socket
import time
import ubinascii
import config
import pycom


def pack_cb(pack):
    """Callback for wifi-sniffer. Sets 'device_found' to True."""
    global device_found
    mac = bytearray(6)
    pk = wlan.wifi_packet()
    control = pk.data[0]
    subtype = (0xF0 & control) >> 4
    type = 0x0C & control
    #print("Control:{}, subtype:{}, type:{}".format(control, subtype, type))
    if subtype == 4:
        # for i in range (0,6):
        #    mac[i] = pk.data[10 + i]
        #print ("Wifi Node with MAC: {}".format(ubinascii.hexlify(mac)))
        device_found = True


#Variables
pin_str         = 'P18'
pir             = Pin(pin_str, mode=Pin.IN, pull=None)
device_found    = False
wlan            = WLAN(mode=WLAN.STA, antenna=WLAN.EXT_ANT)
# 1 if interrupted by PIR, 2 if timeout
wake_reason     = machine.wake_reason()[0]
# True if motion's been detected. False if not.
high            = True if machine.wake_reason()[1] != [] else False


#Wifi-sniffer
wlan.callback(trigger=WLAN.EVENT_PKT_MGMT, handler=pack_cb)
wlan.promiscuous(True)


# If awoken by PIR interrupt.
if wake_reason == 1:
    # If no motion is detected.
    if not high:
        print(0)
        machine.pin_sleep_wakeup([pir], mode=machine.WAKEUP_ANY_HIGH)
        machine.deepsleep(86400000)
    # If wifi units are nearby
    elif device_found:
        print(1)
    # If motion is detected and no wifi units are nearby.
    else:
        print(2)
    # Go to sleep for 15 minutes. Interrupts if no motion's detected.
    machine.pin_sleep_wakeup([pir], mode=machine.WAKEUP_ALL_LOW)
    machine.deepsleep(900000)
# Go to sleep for 24 hours.
machine.pin_sleep_wakeup([pir], mode=machine.WAKEUP_ANY_HIGH)
machine.deepsleep(86400000)
