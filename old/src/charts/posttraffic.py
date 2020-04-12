import requests
from time import sleep
from random import uniform
from time import gmtime, strftime

url = "http://127.0.0.1:3000/charts"

def post(value):
    try:
        data =	{
            "data":
            {
                "id":"test",
                "type":"charts",
                "attributes":{
                    "cmd":"log",
                    "data": str(value),
                    "logname":"random"
                }		
            }
        }
        print("Data:",value,"To:",url)
        r = requests.post( url, json = data)
        print("Response",r)
    except Exception:
        print("Post Failure", strftime("%Y-%m-%d %H:%M:%S", gmtime()))

while True:
    val = uniform(0,10)
    post(val)
    sleep(1)