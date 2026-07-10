from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List
import uuid

from database import HOTELS

app = FastAPI(title="Dummy Hotel Website")


class BookingRequest(BaseModel):
    hotel_id: int
    user_id: str
    check_in: str
    check_out: str
    guests: int


@app.get("/", response_class=HTMLResponse)
def home():

    html = """
    <html>
    <head>
        <title>Hotel Booking</title>
        <style>
            body{
                font-family:Arial;
                background:#f4f4f4;
                padding:30px;
            }
            .card{
                background:white;
                padding:20px;
                margin:20px;
                border-radius:10px;
                box-shadow:0 0 10px #ccc;
            }
        </style>
    </head>
    <body>
        <h1>Available Hotels</h1>
    """

    for h in HOTELS:
        html += f"""
        <div class='card'>
            <h2>{h['name']}</h2>
            <p>City: {h['city']}</p>
            <p>Price: ₹{h['price_per_night']}/night</p>
            <p>Rating: {h['rating']}</p>
            <p>Stars: {'⭐'*h['stars']}</p>
            <p>Amenities: {", ".join(h['amenities'])}</p>
            <p>Available: {h['available']}</p>
        </div>
        """

    html += "</body></html>"
    return html


@app.get("/hotels/search")
def search_hotels(
    destination: str,
    check_in: str,
    check_out: str,
    max_price: int | None = None,
    min_rating: float | None = None,
    min_stars: int | None = None,
    amenities: str | None = None,
):

    results = HOTELS

    results = [
        h for h in results
        if h["city"].lower() == destination.lower()
    ]

    if max_price:
        results = [
            h for h in results
            if h["price_per_night"] <= max_price
        ]

    if min_rating:
        results = [
            h for h in results
            if h["rating"] >= min_rating
        ]

    if min_stars:
        results = [
            h for h in results
            if h["stars"] >= min_stars
        ]

    if amenities:
        wanted = amenities.split(",")

        results = [
            h for h in results
            if all(a in h["amenities"] for a in wanted)
        ]

    return {
        "hotels": results
    }


@app.post("/hotels/book")
def book_hotel(req: BookingRequest):

    hotel = next(
        (h for h in HOTELS if h["id"] == req.hotel_id),
        None
    )

    if hotel is None:
        return {
            "success": False,
            "message": "Hotel not found"
        }

    nights = 2

    total = hotel["price_per_night"] * nights

    return {
        "success": True,
        "booking_id": str(uuid.uuid4()),
        "total_price": total,
        "message": "Booking confirmed"
    }