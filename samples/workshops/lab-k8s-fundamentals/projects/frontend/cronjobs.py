from __future__ import print_function

import schedule
import time
import os

def hourly():
    os.system('just clear-sessions')

schedule.every().hour.do(hourly)

while True:
    schedule.run_pending()
    time.sleep(1)
