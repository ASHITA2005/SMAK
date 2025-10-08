from flask import Flask
import pymongo

app = Flask(__name__)
client = pymongo.MongoClient("mongodb://127.0.0.1:27017")
database = client["authenticate"]
collection = database["authenticate_collection"]
