"""
Chennai Traffic Zones
Real junction data with GPS coordinates
"""

from dataclasses import dataclass, field
from typing import List

@dataclass
class TrafficZone:
    id: str
    name: str
    area: str
    lat: float
    lng: float
    camera_count: int = 1
    priority: str = "medium"  # low, medium, high

# All monitored Chennai junctions
CHENNAI_ZONES: List[TrafficZone] = [
    TrafficZone("kathipara",    "Kathipara Junction",       "Guindy",       13.0067, 80.2206, 4, "high"),
    TrafficZone("koyambedu",    "Koyambedu Signal",         "Koyambedu",    13.0694, 80.1947, 3, "high"),
    TrafficZone("tnagar",       "T Nagar Pondy Bazaar",     "T Nagar",      13.0418, 80.2341, 3, "high"),
    TrafficZone("annasalai",    "Anna Salai / LB Road",     "Anna Salai",   13.0569, 80.2425, 2, "high"),
    TrafficZone("omr_perungudi","OMR Perungudi Toll",        "OMR",          12.9633, 80.2430, 2, "high"),
    TrafficZone("omr_sholing",  "OMR Sholinganallur",        "OMR",          12.9010, 80.2279, 2, "medium"),
    TrafficZone("velachery",    "Velachery Main Road",       "Velachery",    12.9815, 80.2209, 2, "medium"),
    TrafficZone("guindy",       "Guindy Industrial Estate",  "Guindy",       13.0067, 80.2113, 2, "medium"),
    TrafficZone("porur",        "Porur Junction",            "Porur",        13.0357, 80.1567, 2, "medium"),
    TrafficZone("tambaram",     "Tambaram Sanatorium",       "Tambaram",     12.9249, 80.1000, 1, "low"),
    TrafficZone("marina",       "Marina Beach Road",         "Marina",       13.0500, 80.2824, 1, "low"),
    TrafficZone("adyar",        "Adyar Signal",              "Adyar",        13.0012, 80.2565, 2, "medium"),
]

# Quick lookup by ID
ZONES_BY_ID = {z.id: z for z in CHENNAI_ZONES}
